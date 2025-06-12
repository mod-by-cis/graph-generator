# sztuczki regex

## znajdź daty,i wstaw coś na końcu

-  znajdź `(@lastmodified\s+\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z)`
-  zamień na `$1+02:00`
-  
## znajdź daty,i wstaw coś na końcu,jeśli już nie maja
-  znajdź `(@lastmodified\s+\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z)(?!\+\d{2}:\d{2})`
-  zamień na `$1+02:00`
