// Command apply deletes the files and declaration spans reported by measure and then fixes
// imports with golang.org/x/tools/imports.
//
// usage: apply <out.json> <out.json.spans> <path-substring, e.g. libs/openai-go/>
package main

import (
	"encoding/json"
	"fmt"
	"os"
	"sort"
	"strings"

	"golang.org/x/tools/imports"
)

// usage: apply out.json out.json.spans prefix
func main() {
	var out []struct {
		File           string
		Total, Reached int
	}
	b, _ := os.ReadFile(os.Args[1])
	json.Unmarshal(b, &out)
	var spans map[string][][2]int
	b, _ = os.ReadFile(os.Args[2])
	json.Unmarshal(b, &spans)
	prefix := os.Args[3]
	nd := 0
	for _, f := range out {
		if strings.Contains(f.File, prefix) && f.Reached == 0 {
			os.Remove(f.File)
			nd++
		}
	}
	ne := 0
	for f, sp := range spans {
		if !strings.Contains(f, prefix) {
			continue
		}
		src, err := os.ReadFile(f)
		if err != nil {
			continue
		}
		lines := strings.Split(string(src), "\n")
		del := make([]bool, len(lines)+2)
		for _, s := range sp {
			for i := s[0]; i <= s[1] && i <= len(lines); i++ {
				del[i] = true
			}
		}
		var keep []string
		for i, l := range lines {
			if !del[i+1] {
				keep = append(keep, l)
			}
		}
		res, err := imports.Process(f, []byte(strings.Join(keep, "\n")), &imports.Options{Comments: true, TabWidth: 8, TabIndent: true, FormatOnly: false})
		if err != nil {
			fmt.Fprintln(os.Stderr, "ERR", f, err)
			res = []byte(strings.Join(keep, "\n"))
		}
		os.WriteFile(f, res, 0644)
		ne++
	}
	_ = sort.Strings
	fmt.Println("deleted files", nd, "edited files", ne)
}
