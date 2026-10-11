import subprocess,sys,os,re
"""Put the upstream *_test.go files back into a slimmed libs/<sdk> and drop the ones that
reference pruned symbols (or removed packages), iterating until the rest compiles.
Then run what is left. Test files are restored from the submodule's committed revision.

usage: restore_tests.py <openai-go|anthropic-sdk-go|go-genai>      (run after reproduce.sh)
Leaves the restored test files in the working tree; remove with:  find libs/<sdk> -name '*_test.go' -delete
"""
tb=os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","..",".."))
sdk=sys.argv[1]          # e.g. openai-go
d=f"{tb}/libs/{sdk}"
def sh(cmd,cwd=d):
    return subprocess.run(cmd,shell=True,cwd=cwd,capture_output=True,text=True,env={**os.environ,"GOWORK":"off"})
files=sh("git ls-files | grep '_test.go$'").stdout.split()
restored=[]
for f in files:
    pkgdir=os.path.dirname(f) or "."
    if not os.path.isdir(os.path.join(d,pkgdir)) or not [x for x in os.listdir(os.path.join(d,pkgdir)) if x.endswith('.go') and not x.endswith('_test.go')]: continue   # package removed entirely
    dst=os.path.join(d,f)
    src=sh(f"git show HEAD:{f}").stdout
    open(dst,"w").write(src); restored.append(f)
print(sdk,"restored",len(restored),"of",len(files),"test files (others live in removed packages)")
removed=0
for it in range(60):
    r=sh("go test -count=1 -run '^$' -gcflags=-e ./... 2>&1")
    txt=r.stdout+r.stderr
    bad=set()
    # compile errors: ./dir/file_test.go:12:3 or dir/file_test.go:12:3 (paths relative to module root or package dir)
    cur=None
    for line in txt.splitlines():
        m=re.match(r'^# (\S+)',line)
        if m:
            pk=m.group(1).split(' ')[0]; cur=pk.replace("github.com/openai/openai-go/v3","").replace("github.com/anthropics/anthropic-sdk-go","").replace("_test","").lstrip("/")
        m=re.match(r'^(?:vet: )?(?:\./)?(\S+_test\.go):\d+',line)
        if m: bad.add(os.path.normpath(os.path.join(cur or "",m.group(1))) if not os.path.exists(os.path.join(d,m.group(1))) else m.group(1))
    # setup failures: test imports a removed package
    for m in re.finditer(r'imports (\S+): build constraints exclude|imports (\S+): no required module|cannot find package "(\S+)"',txt):
        pkg=[g for g in m.groups() if g][0]
        rel=pkg.split("/v3/")[-1] if "/v3/" in pkg else pkg.split("anthropic-sdk-go/")[-1]
        for root,_,fs in os.walk(d):
            for f in fs:
                if f.endswith("_test.go") and rel in open(os.path.join(root,f)).read():
                    bad.add(os.path.relpath(os.path.join(root,f),d))
    if not bad: break
    for b in bad:
        p=os.path.join(d,b)
        if os.path.exists(p): os.remove(p); removed+=1
restored=[os.path.relpath(os.path.join(r,f),d) for r,_,fs in os.walk(d) for f in fs if f.endswith("_test.go")]
print(sdk,"test files dropped because they reference pruned symbols:",removed,"; remaining:",len(restored))
r=sh("go test ./... -count=1 2>&1")
out=r.stdout
print("\n".join(l for l in out.splitlines() if not l.startswith("ok") and "no test files" not in l)[-3000:])
print("OK packages:",sum(1 for l in out.splitlines() if l.startswith("ok")),"FAIL lines:",sum(1 for l in out.splitlines() if l.startswith("FAIL") or l.startswith("--- FAIL")))
v=sh("go test ./... -count=1 -v 2>&1").stdout
print("tests: PASS",len(re.findall(r'^\s*--- PASS',v,re.M)),"FAIL",len(re.findall(r'^\s*--- FAIL',v,re.M)),"SKIP",len(re.findall(r'^\s*--- SKIP',v,re.M)))
