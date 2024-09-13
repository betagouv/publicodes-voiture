import fs from "fs"

// Files to choose from in scripts/data which are just HTML files corresponding to https://www.quechoisir.org/comparatif-voiture-citadine-n3/
const filePath = "scripts/data/quechoisir/suv-essence-diesel"

const file = fs.readFileSync(filePath + ".html", "utf-8")

let json = {
  items: {},
  total: 0,
  nbItems: 0,
}

for (const match of file.matchAll(/data-price="(\d+)"\n\s*data-name="(.+)"/g)) {
  json.items[match[2]] = match[1]
  json.total += parseInt(match[1])
  json.nbItems++
}

json.average = json.total / json.nbItems

console.log(`✅ ${filePath} processed`)
console.log(`nbItems: ${json.nbItems}`)
console.log(`  total: ${json.total}€`)
console.log(`average: ${json.average}€`)

fs.writeFileSync(filePath + ".json", JSON.stringify(json))
