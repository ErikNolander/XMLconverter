const fs = require('fs');

// funktion för att inte få ogiltiga XML tecken
function escapeXml(value) {
  return value.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&apos;');
}

function fileReader(inputFile) {
    const file = fs.readFileSync(inputFile, 'utf8');
    const block = file.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    const records = [];
    for (let i = 0; i < block.length; i++) {
        const parts = block[i].split('|'); // lägga till ',' för att supporta csv fil etc?
        const type = parts[0].trim();
        const content = parts.slice(1);
        records.push({ type, content });
    }
    return records;
}

function fileConverter(records, outputFile) {
    const buildings = [];
    let currentBuilding = null;
    let currentOwner = null;
    let currentCompany = null;
    records.forEach(record => {
        if (record.type === 'B') {
            currentBuilding = { name: record.content[0], addresses: [], owners: [], companies: []};
            buildings.push(currentBuilding);
            currentOwner = null;
            currentCompany = null;
        }
        if (record.type === 'A') {
            let address = { street: record.content[0], city: record.content[1], zipcode: record.content[2] };
            if (currentOwner) {
                currentOwner.addresses.push(address);
            }
            else if (currentCompany) {
                currentCompany.addresses.push(address);
            }
            else {
                currentBuilding.addresses.push(address);
            }
        }
        if (record.type === 'O') {
            currentOwner = { name: record.content[0], telephones: [], addresses: []};
            currentBuilding.owners.push(currentOwner);
            currentCompany = null;
        }
        if (record.type === 'C') {
            currentCompany = { name: record.content[0], type: record.content[1], telephones: [], addresses: []};
            currentBuilding.companies.push(currentCompany);
            currentOwner = null;
        }
        if (record.type === 'T') {
            let phone = { landline: record.content[0], fax: record.content[1] };
            if (currentOwner) {
                currentOwner.telephones.push(phone);
            }
            else if (currentCompany) {
                currentCompany.telephones.push(phone);
            }
        }
    }
);
const xml = xmlBuilder(buildings);
fs.writeFileSync(outputFile, xml, 'utf8');
}

function xmlBuilder(buildings) {
    const xmlLines = ['<?xml version="1.0" encoding="UTF-8"?>', '<buildings>'];

    buildings.forEach(building => {
        xmlLines.push(`  <building>`);
        xmlLines.push(`    <name>${escapeXml(building.name)}</name>`);
        building.addresses.forEach(address => {
            xmlLines.push(`    <address>`);
            xmlLines.push(`      <street>${address.street}</street>`);
            xmlLines.push(`      <city>${address.city}</city>`);
            xmlLines.push(`      <zipcode>${address.zipcode}</zipcode>`);
            xmlLines.push(`    </address>`);
        });
        building.owners.forEach(owner => {
            xmlLines.push(`    <owner>`);
            xmlLines.push(`      <name>${escapeXml(owner.name)}</name>`);
            owner.telephones.forEach(phone => {
                xmlLines.push(`      <phone>`);
                xmlLines.push(`        <landline>${phone.landline}</landline>`);
                xmlLines.push(`        <fax>${phone.fax}</fax>`);
                xmlLines.push(`      </phone>`);
            });
            owner.addresses.forEach(address => {
                xmlLines.push(`      <address>`);
                xmlLines.push(`        <street>${address.street}</street>`);
                xmlLines.push(`        <city>${address.city}</city>`);
                xmlLines.push(`        <zipcode>${address.zipcode}</zipcode>`);
                xmlLines.push(`      </address>`);
            });
            xmlLines.push(`    </owner>`);
        });
        building.companies.forEach(company => {
            xmlLines.push(`    <company>`);
            xmlLines.push(`      <name>${escapeXml(company.name)}</name>`);
            xmlLines.push(`      <type>${company.type}</type>`);
            company.telephones.forEach(phone => {
                xmlLines.push(`      <phone>`);
                xmlLines.push(`        <landline>${phone.landline}</landline>`);
                xmlLines.push(`        <fax>${phone.fax}</fax>`);
                xmlLines.push(`      </phone>`);
            });
            company.addresses.forEach(address => {
                xmlLines.push(`      <address>`);
                xmlLines.push(`        <street>${address.street}</street>`);
                xmlLines.push(`        <city>${address.city}</city>`);
                xmlLines.push(`        <zipcode>${address.zipcode}</zipcode>`);
                xmlLines.push(`      </address>`);
            });
            xmlLines.push(`    </company>`);
        });
        xmlLines.push(`  </building>`);
    });
    xmlLines.push('</buildings>');
    return xmlLines.join('\n');
}

module.exports = {
    fileReader,
    fileConverter
};