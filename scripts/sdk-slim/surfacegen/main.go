// Command surfacegen writes surface/surface.go: one `var _ = pkg.X` line per exported SDK
// symbol (type, func, const, var, method) used by the code under a root prefix.
//
// usage: surfacegen <module-dir> <sdk-import-path> <root-prefix> <out-file> <import-path-to-write>
package main

import (
	"fmt"
	"go/types"
	"os"
	"sort"
	"strings"

	"golang.org/x/tools/go/packages"
)

// usage: surfacegen <tingly-box dir> <sdk pkg path> <root prefix> <out file> <import path to write>
func main() {
	dir, sdk, rootPrefix, out, impath := os.Args[1], os.Args[2], os.Args[3], os.Args[4], os.Args[5]
	cfg := &packages.Config{Dir: dir, Mode: packages.LoadAllSyntax, Tests: false}
	pkgs, err := packages.Load(cfg, "./...")
	if err != nil {
		panic(err)
	}
	lines := map[string]bool{}
	for _, p := range pkgs {
		if !strings.HasPrefix(p.PkgPath, rootPrefix) {
			continue
		}
		for _, obj := range p.TypesInfo.Uses {
			if obj.Pkg() == nil || obj.Pkg().Path() != sdk || !obj.Exported() {
				continue
			}
			switch o := obj.(type) {
			case *types.TypeName:
				if o.Parent() != obj.Pkg().Scope() {
					continue
				}
				if named, ok := o.Type().(*types.Named); ok && named.TypeParams().Len() > 0 {
					continue
				}
				lines[fmt.Sprintf("var _ pkg.%s", o.Name())] = true
			case *types.Const, *types.Var:
				if o.Parent() == obj.Pkg().Scope() {
					lines[fmt.Sprintf("var _ = pkg.%s", o.Name())] = true
				}
			case *types.Func:
				sig := o.Type().(*types.Signature)
				if sig.Recv() == nil {
					if sig.TypeParams().Len() == 0 {
						lines[fmt.Sprintf("var _ = pkg.%s", o.Name())] = true
					}
					continue
				}
				rt := sig.Recv().Type()
				ptr := ""
				if pt, ok := rt.(*types.Pointer); ok {
					rt = pt.Elem()
					ptr = "*"
				}
				if n, ok := rt.(*types.Named); ok && n.Obj().Pkg() != nil && n.Obj().Pkg().Path() == sdk && n.TypeParams().Len() == 0 && n.Obj().Exported() {
					if ptr == "*" {
						lines[fmt.Sprintf("var _ = (*pkg.%s).%s", n.Obj().Name(), o.Name())] = true
					} else {
						lines[fmt.Sprintf("var _ = pkg.%s.%s", n.Obj().Name(), o.Name())] = true
					}
				}
			}
		}
	}
	var ls []string
	for l := range lines {
		ls = append(ls, l)
	}
	sort.Strings(ls)
	var b strings.Builder
	b.WriteString("// Package surface is the explicit list of SDK symbols the tingly protocol layer\n// depends on. Everything reachable from here is kept when slimming; the rest is removed.\npackage surface\n\nimport pkg \"" + impath + "\"\n\n")
	for _, l := range ls {
		b.WriteString(l + "\n")
	}
	os.WriteFile(out, []byte(b.String()), 0644)
	fmt.Println(len(ls), "entries")
}
