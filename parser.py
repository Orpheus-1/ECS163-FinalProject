import csv

with open("california2.csv", mode="w", newline='') as writeFile:

    
    with open("data.csv", mode="r", encoding='cp932', errors='ignore') as file:
        csvFile = csv.DictReader(file)
        writer = csv.DictWriter(writeFile, fieldnames=csvFile.fieldnames)
        writer.writeheader()

        for lines in csvFile:
            if  lines["STATE"] == "CA":
                writer.writerow(lines)


# with open("california.csv") as input, open("california.csv", 'w', newline='') as output:
#      writer = csv.writer(output)
#      for row in csv.reader(input):
#          if any(field.strip() for field in row):
#              writer.writerow(row)
