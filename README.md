# Vannovervakning-api
Et enkelt API (Application Programming Interface) for å sende målinger fra [TheThingsNetwork](https://www.thethingsnetwork.org/) med en POST-request til en URL, og senere hente målingene med en GET-request.

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
---
## Bruk

### Opplasting fra TTN
Målinger som gjøres av sensornoden kan være en av følgende typer (`type`s): 

`
PH, CONDUCTIVITY, TURBIDITY, TEMPERATURE, TEMPERATURE_INSIDE, HUMIDITY, BATTERY, LID, DISSOLVED_OXYGEN
`

Dersom det er behov for å legge til støtte for en annen type måling bes dere ta kontakt med meg (Leik Lima-Eriksen).

For å sende data fra TTN til API-et for lagring gjøres en POST-request til 

```
http://vannovervakning.com:5000/api/v1/measurements/<GRUPPENR>
```

Der `<GRUPPENR>` byttes ut med nummeret til din gruppe.   

For din del vil dette si at under `Integrations` skal du legge til en integrasjon av typen `HTTP Integration` med URL som vist over for å få dette satt opp riktig.

Data som sendes fra TTN (Det som returneres i `Payload Formats`) må være på formatet som vist under. 

``` javascript
{
	data: [
		{
			type: "TEMPERATURE",
			value: 21.3
		},
		{
			type: "CONDUCTIVITY",
			value: 120
		}
		.
		.
		.
	]
}
```


Et eksempel på en veldig enkel payloadfunksjon:

```javascript

function Decoder(bytes, port) {
    //Definerer de ulike elementene i bufferen
    var temp = ((bytes[0] << 8) + bytes[1]);
    var turb = bytes[2];
    
    //Returerer verdiene.
    return {
      data: [
          {
              type: "TEMPERATURE",
              value: temp,
          },
          {
              type: "TURBIDITY",
              value: turb
          }
      ]
    };
}
```
Legg forøvrig merke til at de tallverdiene dere sender til API-et er også slik de vil lagres for senere uthenting. Det vil si at hvis du tar imot en analog temperaturavlesning på feks `502` må du konvertere denne til en faktisk temperatur før du sender det til API-et.

### Hente ut data

**TIPS**: Alle responsene API-et gir bruker `JSON`-formatet (JavaScript Object Notation). Mest sannsynlig har programmeringsspråket du bruker støtte for deserialisering av dette. Google feks `<PROGRAMMERINGSSPRÅK> json parse` for mer info mtp ditt valgte `<PROGRAMMERINGSSPRÅK>`.

#### Siste avlesninger

For å hente ut de siste sensoravlesningene sendes en slik GET-request til API-et.

```
https://vannovervakning.com/api/v1/measurements/<GRUPPENR>
```
Der `<GRUPPENR>` som vanlig byttes ut med nummeret til din gruppe (vil ikke bli gjentatt videre).

Responsen blir den siste målingen for hver av sensorene for den spesifiserte sensornoden. Eksempel på en slik respons:

```
{
    "nodeId": 1,
    "data": {
        "HUMIDITY": [
            {
                "value": 10,
                "timeCreated": "2019-02-06T09:41:55.432Z"
            }
        ],
        "BATTERY": [
            {
                "value": 30,
                "timeCreated": "2019-02-06T09:41:55.431Z"
            }
        ]
    }
}

```

#### Sensoravlesninger innenfor tidsintervall

For å hente ut målinger innenfor et tidsintervall brukes URLen på følgende format.

```
https://vannovervakning.com/api/v1/measurements/<GRUPPENR>/<FROM_TIMESTAMP_MS>/<TO_TIMESTAMP_MS>
```

der `<FROM_TIMESTAMP_MS>` og `<TO_TIMESTAMP_MS>` er UNIX timestamp i millisekunder. 

**TIPS**: Dette tilsvarer formatet du får av javascript-funksjonen `Date.now()`

Responsen vil ha samme format som for siste avlesninger, men nå vil arrayene for hver av `type`s inneholde flere avlesninger. Eksempel på en slik respons:

```javascript
{
    "nodeId": 1,
    "data": {
        "PH": [
            {
                "value": 7.8,
                "timeCreated": "2019-03-01T11:55:03.390Z",
                "position": {}
            },
            {
                "value": 7.8,
                "timeCreated": "2019-03-01T11:55:03.372Z",
                "position": {}
            }
        ],
        "BATTERY": [
		{
                "value": 20,
                "timeCreated": "2019-02-22T09:14:20.806Z",
                "position": {}
            },
            {
                "value": 15,
                "timeCreated": "2019-02-21T22:45:33.735Z",
                "position": {}
            },
        ]
    }
}
```

Dersom man ønsker å hente ut data fra et bestemt tidspunkt frem til nå kan `<TO_TIMESTAMP_MS>` sløyfes. En slik request vil altså ha formatet som vist under:

```
https://vannovervakning.com/api/v1/measurements/<GRUPPENR>/<FROM_TIMESTAMP_MS>
```

Det kan være verdt å merke seg (med tanke på optimalisering av nettsiden deres) at det er garantert at rekkefølgen på sensoravlesningene kommer i synkende rekkefølge sortert etter timestamp. Dvs at de nyeste avlesningene kommer øverst i arrayet.

#### Filtrering

API-et har også støtte for filtrering basert på målingstyper. I utgangspunktet vil man få alle slags målingstyper som tilfredsstiller `<GRUPPENR>` og evt tidsavgrensningen dersom det er lagt inn. Men dersom man kun ønsker noen spesifikke målinger kan man legge til `?types=<TYPE>,<TYPE>,...` på slutten av URL-en. Et eksempel på en slik query med gruppenr, tidsavgrensning og `types`-avgrensning er følgende:

```
https://vannovervakning.com/api/v1/measurements/1/1551434764874?types=PH,CONDUCTIVITY
```
eller med `<TO_TIMESTAMP_MS>`:

```
https://vannovervakning.com/api/v1/measurements/1/1551434764874/1551442024867?types=CONDUCTIVITY
```


Det kan settes inn så mange sensortyper som ønskelig for `<TYPE>`.

#### Aggregat-funksjoner

En siste hendig funksjon ved API-et er muligheten til å aggregere målingene som man henter ut. Dersom det gjøres en query med tidsavgrensning, kan man legge til `?aggregate=<AGGREGATE>` på slutten av URL-en for å kjøre et aggregat på alle målingene man henter ut, og aggregatet er det som returneres. `<AGGREGATE>` kan være en av følgende verdier: 

`
HIGHEST, LOWEST, AVERAGE
`

Eksempler på slike forespørsler:

```
https://vannovervakning.com/api/v1/measurements/1/1551434764874?types=PH,CONDUCTIVITY&aggregate=HIGHEST
```

```
https://vannovervakning.com/api/v1/measurements/1/1551434764874/1551442024867?aggregate=LOWEST
```

```
https://vannovervakning.com/api/v1/measurements/1/1551434764874?aggregate=AVERAGE
```

Eksempel på responsen slike forespørsler gir:


**For `AVERAGE`**:

```javascript
{
    "nodeId": 1,
    "data": {
        "TURBIDITY": [
            {
                "value": 348.7556962025316
            }
        ],
        "TEMPERATURE": [
            {
                "value": 23.533417721518983
            }
        ],
        "PH": [
            {
                "value": 7.778101265822785
            }
        ],
        "CONDUCTIVITY": [
            {
                "value": 0
            }
        ]
    }
}
```

**For `HIGEST` og `LOWEST`** :


```javascript
{
    "nodeId": 1,
    "data": {
        "TURBIDITY": [
            {
                "value": 1425,
                "timeCreated": "2019-03-01T11:54:38.129Z",
                "position": null
            }
        ],
        "TEMPERATURE": [
            {
                "value": 30.9,
                "timeCreated": "2019-03-01T11:50:29.988Z",
                "position": null
            }
        ],
        "PH": [
            {
                "value": 9.4,
                "timeCreated": "2019-03-01T11:13:04.545Z",
                "position": null
            }
        ],
        "CONDUCTIVITY": [
            {
                "value": 0,
                "timeCreated": "2019-03-01T10:32:48.394Z",
                "position": null
            }
        ]
    }
}
```