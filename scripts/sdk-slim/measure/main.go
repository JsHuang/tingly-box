// Command measure does declaration-level reachability analysis of the vendored SDKs
// (libs/openai-go, libs/anthropic-sdk-go, libs/go-genai) from the code that uses them,
// and emits what is NOT reachable so that apply can delete it.
// See .design/sdk-slim.md.
//
// usage: measure <module-dir> <out.json>      (also writes <out.json>.spans)
//
// Environment:
//
//	ROOTPREFIX     only packages whose import path has this prefix are roots (default: all
//	               packages of the main module and workspace modules)
//	SDKPREFIX      import-path prefix of the SDK being analysed (default: the three SDKs)
//	PATTERNS       comma separated `go list` patterns for the roots (default: ./... of the
//	               tingly-box modules)
//	NOTESTS=1      do not load test files (default: tests are roots too)
//	NOSVC=1        do not apply the Stainless "Service/Client" field-pruning rule
//	               (required for go-genai, whose Client is built with a struct literal)
//	CLOSEDMETHODS=1  closed-world mode: methods of reached types are kept only if
//	               referenced or in a small set of well-known interface methods; the dropped
//	               ones are listed in <out.json>.dropped_methods
package main

import (
	"encoding/json"
	"fmt"
	"go/ast"
	"go/token"
	"go/types"
	"os"
	"regexp"
	"sort"
	"strings"

	"golang.org/x/tools/go/packages"
)

var sdkPrefixes = []string{"github.com/anthropics/anthropic-sdk-go", "github.com/openai/openai-go/v3", "google.golang.org/genai"}

func sdkOf(path string) string {
	if rp := os.Getenv("ROOTPREFIX"); rp != "" && os.Getenv("SDKPREFIX") != "" && strings.HasPrefix(path, rp) {
		return ""
	}
	if sp := os.Getenv("SDKPREFIX"); sp != "" {
		if path == sp || strings.HasPrefix(path, sp+"/") {
			return sp
		}
		return ""
	}
	for _, p := range sdkPrefixes {
		if path == p || strings.HasPrefix(path, p+"/") {
			return p
		}
	}
	return ""
}

type node struct {
	id       int
	file     string
	lines    int
	pkg      string
	name     string
	edges    []int
	reached  bool
	isInit   bool
	svcField bool
	from, to int
}

var nodes []*node
var objNode = map[types.Object]int{}
var fieldNode = map[types.Object]int{} // field obj -> pseudo node (service fields)
var methodsOf = map[int][]int{}
var svcType = map[int]bool{}
var ctorOf = map[int][]int{} // service type node -> ctor funcs
var svcCtorFn = map[int]bool{}

type stmtCand struct {
	file     string
	from, to int
	field    int
}

var stmtCands []stmtCand

var keepMethod = map[string]bool{"String": true, "GoString": true, "Error": true, "Unwrap": true, "Is": true, "As": true,
	"MarshalJSON": true, "UnmarshalJSON": true, "MarshalText": true, "UnmarshalText": true, "MarshalBinary": true, "UnmarshalBinary": true,
	"Scan": true, "Value": true, "Format": true, "Len": true, "Less": true, "Swap": true, "Read": true, "Write": true, "Close": true,
	"RoundTrip": true, "Do": true, "Seq": true, "Next": true}

var methodSet = map[int]bool{}
var methodRecv = map[int]int{}

var svcRe = regexp.MustCompile(`(Service|^Client)$`)
var ctorRe = regexp.MustCompile(`^New(.*)$`)

func newNode(fset *token.FileSet, pkg, name string, from, to token.Pos) *node {
	f := fset.Position(from)
	t := fset.Position(to)
	n := &node{id: len(nodes), file: f.Filename, lines: t.Line - f.Line + 1, pkg: pkg, name: name, from: f.Line, to: t.Line}
	nodes = append(nodes, n)
	return n
}

func recvName(fd *ast.FuncDecl) string {
	if fd.Recv == nil || len(fd.Recv.List) == 0 {
		return ""
	}
	t := fd.Recv.List[0].Type
	for {
		switch x := t.(type) {
		case *ast.StarExpr:
			t = x.X
		case *ast.IndexExpr:
			t = x.X
		case *ast.IndexListExpr:
			t = x.X
		case *ast.ParenExpr:
			t = x.X
		case *ast.Ident:
			return x.Name
		default:
			return ""
		}
	}
}

func main() {
	if os.Getenv("NOSVC") != "" {
		svcRe = regexp.MustCompile(`a^`)
	}
	root := os.Args[1]
	cfg := &packages.Config{Dir: root, Mode: packages.LoadAllSyntax, Tests: os.Getenv("NOTESTS") == ""}
	pats := []string{}
	if pe := os.Getenv("PATTERNS"); pe != "" {
		pats = strings.Split(pe, ",")
	} else {
		pats = []string{"./...", "./afk/...", "./agentboot/...", "./ai/...", "./imbot/...", "./swagger/...", "./gui/wails3/..."}
	}
	initial, err := packages.Load(cfg, pats...)
	if err != nil {
		panic(err)
	}
	all := map[string]*packages.Package{}
	var visit func(p *packages.Package)
	visit = func(p *packages.Package) {
		if all[p.ID] != nil {
			return
		}
		all[p.ID] = p
		for _, i := range p.Imports {
			visit(i)
		}
	}
	for _, p := range initial {
		visit(p)
	}
	var sdkPkgs, userPkgs []*packages.Package
	initSet := map[string]bool{}
	for _, p := range initial {
		initSet[p.ID] = true
	}
	for _, p := range all {
		if sdkOf(p.PkgPath) != "" {
			sdkPkgs = append(sdkPkgs, p)
		} else if initSet[p.ID] && !strings.Contains(p.Dir, "/libs/") && strings.HasPrefix(p.PkgPath, os.Getenv("ROOTPREFIX")) {
			userPkgs = append(userPkgs, p)
		}
	}
	sort.Slice(sdkPkgs, func(i, j int) bool { return sdkPkgs[i].PkgPath < sdkPkgs[j].PkgPath })
	fmt.Fprintf(os.Stderr, "sdk pkgs=%d user pkgs=%d\n", len(sdkPkgs), len(userPkgs))

	type pend struct {
		n    *node
		p    *packages.Package
		root ast.Node
		kind string
		tn   string // for methods: receiver type name
	}
	var pends []pend
	typeNodeByName := map[string]int{} // pkgpath+"."+name
	fnByName := map[string]int{}
	// pass 1: create nodes
	for _, p := range sdkPkgs {
		for _, f := range p.Syntax {
			for _, d := range f.Decls {
				switch d := d.(type) {
				case *ast.FuncDecl:
					from := d.Pos()
					if d.Doc != nil {
						from = d.Doc.Pos()
					}
					n := newNode(p.Fset, p.PkgPath, d.Name.Name, from, d.End())
					if obj := p.TypesInfo.Defs[d.Name]; obj != nil {
						objNode[obj] = n.id
					}
					rn := recvName(d)
					if d.Name.Name == "init" && d.Recv == nil {
						n.isInit = true
					}
					if rn != "" {
						pends = append(pends, pend{n, p, d, "method", rn})
					} else {
						fnByName[p.PkgPath+"."+d.Name.Name] = n.id
						pends = append(pends, pend{n, p, d, "func", ""})
					}
				case *ast.GenDecl:
					if d.Tok == token.IMPORT {
						continue
					}
					pin := false
					if d.Tok == token.CONST && d.Lparen.IsValid() {
						for _, sp := range d.Specs {
							vs := sp.(*ast.ValueSpec)
							if len(vs.Values) == 0 {
								pin = true
							}
							ast.Inspect(vs, func(x ast.Node) bool {
								if id, ok := x.(*ast.Ident); ok && id.Name == "iota" {
									pin = true
								}
								return true
							})
						}
					}
					for _, sp := range d.Specs {
						from, to := sp.Pos(), sp.End()
						if !d.Lparen.IsValid() {
							from = d.Pos()
							if d.Doc != nil {
								from = d.Doc.Pos()
							}
						} else {
							switch s := sp.(type) {
							case *ast.TypeSpec:
								if s.Doc != nil {
									from = s.Doc.Pos()
								}
							case *ast.ValueSpec:
								if s.Doc != nil {
									from = s.Doc.Pos()
								}
							}
						}
						switch s := sp.(type) {
						case *ast.TypeSpec:
							n := newNode(p.Fset, p.PkgPath, s.Name.Name, from, to)
							objNode[p.TypesInfo.Defs[s.Name]] = n.id
							typeNodeByName[p.PkgPath+"."+s.Name.Name] = n.id
							if _, ok := s.Type.(*ast.StructType); ok && svcRe.MatchString(s.Name.Name) {
								svcType[n.id] = true
							}
							pends = append(pends, pend{n, p, s, "type", ""})
						case *ast.ValueSpec:
							n := newNode(p.Fset, p.PkgPath, s.Names[0].Name, from, to)
							if pin {
								n.isInit = true
							}
							for _, nm := range s.Names {
								if o := p.TypesInfo.Defs[nm]; o != nil {
									objNode[o] = n.id
								}
								if nm.Name == "_" {
									n.isInit = true
								}
							}
							pends = append(pends, pend{n, p, s, "value", ""})
						}
					}
				}
			}
		}
	}
	// constructors for service types
	for k, id := range fnByName {
		i := strings.LastIndex(k, ".")
		pkg, name := k[:i], k[i+1:]
		m := ctorRe.FindStringSubmatch(name)
		if m == nil {
			continue
		}
		if tid, ok := typeNodeByName[pkg+"."+m[1]]; ok && svcType[tid] {
			ctorOf[tid] = append(ctorOf[tid], id)
			svcCtorFn[id] = true
		}
	}
	// methods map
	for _, pd := range pends {
		if pd.kind == "method" {
			methodSet[pd.n.id] = true
			if tid, ok := typeNodeByName[pd.p.PkgPath+"."+pd.tn]; ok {
				methodRecv[pd.n.id] = tid
			}
			if tid, ok := typeNodeByName[pd.p.PkgPath+"."+pd.tn]; ok {
				methodsOf[tid] = append(methodsOf[tid], pd.n.id)
			}
		}
	}
	// pass 2: edges; service struct fields become pseudo-nodes
	addEdges := func(n *node, p *packages.Package, root ast.Node, skipSvc bool) {
		seen := map[int]bool{}
		ast.Inspect(root, func(x ast.Node) bool {
			id, ok := x.(*ast.Ident)
			if !ok {
				return true
			}
			obj := p.TypesInfo.Uses[id]
			if obj == nil {
				return true
			}
			if fn, ok := fieldNode[obj]; ok {
				if skipSvc {
					return true
				}
				if !seen[fn] {
					seen[fn] = true
					n.edges = append(n.edges, fn)
				}
				return true
			}
			t, ok := objNode[obj]
			if !ok {
				return true
			}
			if skipSvc && (svcType[t] || svcCtorFn[t]) {
				return true
			}
			if !seen[t] {
				seen[t] = true
				n.edges = append(n.edges, t)
			}
			return true
		})
	}
	// service fields first
	svcFieldsOf := map[int][]*node{}
	for _, pd := range pends {
		if pd.kind != "type" || !svcType[pd.n.id] {
			continue
		}
		st := pd.root.(*ast.TypeSpec).Type.(*ast.StructType)
		for _, fl := range st.Fields.List {
			fnode := newNode(pd.p.Fset, pd.p.PkgPath, pd.n.name+".field", fl.Pos(), fl.End())
			fnode.svcField = true
			fnode.lines = 0
			fnode.from, fnode.to = pd.p.Fset.Position(fl.Pos()).Line, pd.p.Fset.Position(fl.End()).Line
			for _, nm := range fl.Names {
				if o := pd.p.TypesInfo.Defs[nm]; o != nil {
					fieldNode[o] = fnode.id
				}
			}
			addEdges(fnode, pd.p, fl.Type, false)
			svcFieldsOf[pd.n.id] = append(svcFieldsOf[pd.n.id], fnode)
			_ = fnode
		}
	}
	for _, pd := range pends {
		switch pd.kind {
		case "type":
			if svcType[pd.n.id] {
				continue // fields handled separately
			}
			addEdges(pd.n, pd.p, pd.root, false)
		case "func":
			skip := svcCtorFn[pd.n.id] || pd.n.name == "NewClient"
			if skip {
				ast.Inspect(pd.root, func(x ast.Node) bool {
					as, ok := x.(*ast.AssignStmt)
					if !ok || len(as.Lhs) != 1 {
						return true
					}
					se, ok := as.Lhs[0].(*ast.SelectorExpr)
					if !ok {
						return true
					}
					if fn, ok := fieldNode[pd.p.TypesInfo.Uses[se.Sel]]; ok {
						a := pd.p.Fset.Position(as.Pos())
						b := pd.p.Fset.Position(as.End())
						stmtCands = append(stmtCands, stmtCand{a.Filename, a.Line, b.Line, fn})
					}
					return true
				})
			}
			addEdges(pd.n, pd.p, pd.root, skip)
		default:
			addEdges(pd.n, pd.p, pd.root, false)
		}
	}
	// roots from user code
	var work []int
	reach := func(id int) {
		if !nodes[id].reached {
			nodes[id].reached = true
			work = append(work, id)
		}
	}
	for _, p := range userPkgs {
		for _, f := range p.Syntax {
			ast.Inspect(f, func(x ast.Node) bool {
				id, ok := x.(*ast.Ident)
				if !ok {
					return true
				}
				obj := p.TypesInfo.Uses[id]
				if obj == nil {
					return true
				}
				if fn, ok := fieldNode[obj]; ok {
					reach(fn)
				}
				if t, ok := objNode[obj]; ok {
					reach(t)
				}
				return true
			})
		}
	}
	reachedPkgs := map[string]bool{}
	for {
		for len(work) > 0 {
			id := work[len(work)-1]
			work = work[:len(work)-1]
			n := nodes[id]
			reachedPkgs[n.pkg] = true
			for _, e := range n.edges {
				reach(e)
			}
			if !svcType[id] {
				for _, m := range methodsOf[id] {
					if os.Getenv("CLOSEDMETHODS") != "" && !keepMethod[nodes[m].name] {
						continue
					}
					reach(m)
				}
			} else {
				for _, c := range ctorOf[id] {
					reach(c)
				}
			}
		}
		// init roots in reached pkgs
		added := false
		for _, n := range nodes {
			if n.isInit && !n.reached && reachedPkgs[n.pkg] {
				reach(n.id)
				added = true
			}
		}
		if !added && len(work) == 0 {
			break
		}
	}
	// service fields reached => their parent type already counted when type reached by field? ensure type node reached: reaching a field implies owner type
	// (owner reached via user selection of Client usually). Fine.

	type fstat struct {
		File           string
		Total, Reached int
	}
	fs := map[string]*fstat{}
	for _, n := range nodes {
		if n.lines == 0 {
			continue
		}
		s := fs[n.file]
		if s == nil {
			s = &fstat{File: n.file}
			fs[n.file] = s
		}
		s.Total += n.lines
		if n.reached {
			s.Reached += n.lines
		}
	}
	var out []*fstat
	for _, s := range fs {
		out = append(out, s)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].File < out[j].File })
	if os.Getenv("CLOSEDMETHODS") != "" {
		var dropped []string
		for _, n := range nodes {
			if !n.reached && n.lines > 0 && fs[n.file] != nil && fs[n.file].Reached > 0 {
				if rt, isMeth := methodRecv[n.id]; isMeth && nodes[rt].reached {
					dropped = append(dropped, n.pkg+"."+n.name+" "+n.file+":"+fmt.Sprint(n.from))
				}
			}
		}
		sort.Strings(dropped)
		os.WriteFile(os.Args[2]+".dropped_methods", []byte(strings.Join(dropped, "\n")), 0644)
	}
	spans := map[string][][2]int{}
	for _, n := range nodes {
		if n.reached {
			continue
		}
		if n.lines == 0 && !n.svcField {
			continue
		}
		if fs[n.file] != nil && fs[n.file].Reached == 0 {
			continue
		}
		spans[n.file] = append(spans[n.file], [2]int{n.from, n.to})
	}
	for _, c := range stmtCands {
		if !nodes[c.field].reached && (fs[c.file] == nil || fs[c.file].Reached > 0) {
			spans[c.file] = append(spans[c.file], [2]int{c.from, c.to})
		}
	}
	sb, _ := json.MarshalIndent(spans, "", " ")
	os.WriteFile(os.Args[2]+".spans", sb, 0644)
	b, _ := json.MarshalIndent(out, "", " ")
	os.WriteFile(os.Args[2], b, 0644)
	fmt.Fprintf(os.Stderr, "nodes=%d files=%d\n", len(nodes), len(out))
}
