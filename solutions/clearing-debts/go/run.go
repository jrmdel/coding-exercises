package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"runtime"
)

func main() {
	_, filename, _, ok := runtime.Caller(0)
	if !ok {
			panic("No caller information")
	}

	dir := filepath.Dir(filename)
	path := filepath.Join(dir, "../../../exercises/clearing-debts/data.json")

	dataBytes, err := os.ReadFile(path)
	if err != nil {
		log.Fatal(err)
	}

	var data interface{}
	if err := json.Unmarshal(dataBytes, &data); err != nil {
		log.Fatal(err)
	}

	fmt.Printf("%+v\n", data)
}
