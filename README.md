# Vannovervakning-api
Ett enkelt API(aplication programming interface) for å sende målinger fra [thethingsnetwork](https://www.thethingsnetwork.org/) med en POST-request til en database, og hente målingene igjen senere med en GET-request.

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
---
### Opplasting fra ttn
For å laste opp målinger fra ttn er det mulig å enten sende målinger fra en sensor eller fra flere av de støttede typene (PH, CONDUCTIVITY, TURBIDITY, TEMPERATURE, TEMPERATURE_INSIDE, HUMIDITY, BATTERY, DISSOLVED_OXYGEN). 

For å sende data fra ttn til databasen gjøres en POST-request til 
```
https://vannovervakning.com/api/v1/measurements/INSERT_GRUPPENR
```
Der `INSERT_GRUPPENR` byttes ut med nummeret til din gruppe.

Dataen som sendes fra TTN må være på formatet som vist under. 
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
Støttede målinger (`type`) er som tidligere nevnt `PH, CONDUCTIVITY, TURBIDITY, TEMPERATURE, TEMPERATURE_INSIDE, HUMIDITY, BATTERY, DISSOLVED_OXYGEN`. Er det behov for en annen type måling, er det bare å ta kontakt med Leik.

En veldig enkel eksempel payloadfunksjon kan se slik ut:

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
              value: "temp",
          },
          {
              type: "TURBIDITY",
              value: turb
          }
      ]
    };
}
```


For å hente ut verdier sendes en GET-request til databasen.
```
https://vannovervakning.com/api/v1/measurements/INSERT_GRUPPENR/
```
Responsen blir den siste målingen for hver av sensorene for den spesifiserte sensornoden.

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

<br/>

For å hente ut målinger mellom et tidsintervall brukes URLen på følgende format.
```
https://vannovervakning.com/api/v1/measurements/INSERT_GRUPPENR/FROM_TIMESTAMP/TO_TIMESTAMP
```
eller for å hente målinger fra ett spesifikt tidspunkt frem til siste måling kan `TO_TIMESTAMP` fjernes

```
https://vannovervakning.com/api/v1/measurements/INSERT_GRUPPENR/FROM_TIMESTAMP/
```

<br/>
<br/>

For å filtrere ut målinger av en sensor brukes 
```
https://vannovervakning.com/api/v1/measurements/INSERT_GRUPPENR/?types=INSERT_TYPE,INSERT_TYPE
```
eller
```
https://vannovervakning.com/api/v1/measurements/INSERT_GRUPPENR/FROM_TIMESTAMP/TO_TIMESTAMP/?types=INSERT_TYPE,INSERT_TYPE
```

Der det kan settes inn så mange sensortyper som ønskelig for `INSERT_TYPE`<br/>


<br/>
