package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"path/filepath"
)

func main() {
	// Détermine le chemin du fichier
	path := filepath.Join("..", "data.json")

	// Lis le fichier
	dataBytes, err := ioutil.ReadFile(path)
	if err != nil {
		log.Fatal(err)
	}

	// Parse le contenu JSON dans une variable data (de type interface{})
	var data interface{}
	if err := json.Unmarshal(dataBytes, &data); err != nil {
		log.Fatal(err)
	}

	// Affiche le contenu de data
	fmt.Printf("%+v\n", data)
}
