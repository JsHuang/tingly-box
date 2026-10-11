"""Differential test: run the tests that survive in a slimmed SDK tree and the same-named tests in
a pristine copy of the submodule; report any test that passes pristine but fails slim.

usage: diff_tests.py <slim-dir> <pristine-dir>
pristine copy:  mkdir /tmp/p && git -C libs/<sdk> archive HEAD | tar -x -C /tmp/p
"""
import subprocess,json,sys,os
def run(d):
    r=subprocess.run("go test -count=1 -json ./... 2>/dev/null",shell=True,cwd=d,capture_output=True,text=True,env={**os.environ,"GOWORK":"off"})
    res={}
    for l in r.stdout.splitlines():
        try: e=json.loads(l)
        except: continue
        if e.get("Test") and e["Action"] in ("pass","fail","skip"):
            res[(e["Package"].split("/v3")[-1] if "/v3" in e["Package"] else e["Package"].split("sdk-go")[-1] if "sdk-go" in e["Package"] else e["Package"].split("genai")[-1],e["Test"])]=e["Action"]
    return res
slim,pri=sys.argv[1],sys.argv[2]
a=run(slim); b=run(pri)
common=[k for k in a if k in b]
cnt={}
for k in common: cnt[(a[k],b[k])]=cnt.get((a[k],b[k]),0)+1
print("slim tests:",len(a),"pristine tests:",len(b),"in both:",len(common))
for k,v in sorted(cnt.items()): print(" slim=%s pristine=%s : %d"%(k[0],k[1],v))
bad=[k for k in common if a[k]=="fail" and b[k]=="pass"]
print("REGRESSIONS (slim fail, pristine pass):",len(bad)); 
for k in bad[:20]: print("  ",k)
