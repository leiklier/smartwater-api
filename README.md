# Vannovervakning-api
Ett enkelt API(aplication programming interface) for å sende målinger fra [thethingsnetwork](https://www.thethingsnetwork.org/) med en POST-request til en database, og hente målingene igjen senere med en GET-request.

---
### Opplasting fra ttn
For å laste opp målinger fra ttn er det mulig å enten sende målinger fra en sensor eller fra flere av de støttede typene (PH, CONDUCTIVITY, TURBIDITY, TEMPERATURE, BATTERY). 

For å sende data fra ttn til databasen gjøres en POST-request til 
```
188.166.37.247:5000/api/v1/measurements/INSERT_GRUPPENR
```
Der `INSERT_GRUPPENR` byttes ut med nummeret til din gruppe.

Dataen som sendes må være på formatetsom vist under. 
``` javascript
{

timeCreated: INSERT_TIME,

position: {
    lat: INSERT_LATTITUDE,
    lng: INSERT_LONGTITUDE
}

payload: [
    {
        type: INSERT_TYPE, 
        value: INSERT_TYPE,
        timeCreated: INSERT_TIME
    },
    {
        type: INSERT_TYPE, 
        value: INSERT_TYPE,
        timeCreated: INSERT_TIME
    },

    .
    .
    .
  ]
}
```
Både `timeCreated` og `position` er valgfritt. Inne i `payload` kan det legges til så mange målinger som ønskelig. Støttede målinger (`type`) er som tidligere nevnt `PH, CONDUCTIVITY, TURBIDITY, TEMPERATURE, BATTERY`. Er det behov for en annen type måling, er det bare å ta kontakt med Leik.

En veldig enkel eksempel payloadfunksjon kan se slik ut:

```javascript

function Decoder(bytes, port) {
    //Definerer de ulike elementene i bufferen
    var temp = ((bytes[0] << 8) + bytes[1]);
    var turb = bytes[2];
    
    //Returerer verdiene.
    return {
      payload: [
          {
              type: TEMPERATURE,
              value: temp,
          },
          {
              type: TURBIDITY,
              value: turb
          }
      ]
    };
}
```


For å hente ut verdier sendes en GET-request til databasen.
```
188.166.37.247:5000/api/v1/measurements/INSERT_GRUPPENR/
```
Responsen blir alle målingene som har blitt lagret i databasen. I fremtiden vil dette kun returnere den siste målingen, men for øyeblikket returnerer den alle.

```
{
    "nodeId": 1,
    "data": {
        "HUMIDITY": [
            {
                "value": 10,
                "timeCreated": "2019-02-06T09:41:55.432Z"
            },
            {
                "value": 10,
                "timeCreated": "2019-02-06T09:42:30.780Z"
            },
        ],
        "BATTERY": [
            {
                "value": 30,
                "timeCreated": "2019-02-06T09:41:55.431Z"
            },
            {
                "value": 30,
                "timeCreated": "2019-02-06T09:41:55.431Z"
            },
        ]
    }
}

```

<br/>

For å hente ut målinger mellom et tidsintervall brukes URLen på følgende format.
```
188.166.37.247:5000/api/v1/measurements/INSERT_GRUPPENR/FROM_TIMESTAMP/TO_TIMESTAMP
```
eller for å hente målinger fra ett spesifikt tidspunkt frem til siste måling kan `TO_TIMESTAMP` fjernes

```
188.166.37.247:5000/api/v1/measurements/INSERT_GRUPPENR/FROM_TIMESTAMP/
```

<br/>
<br/>

For å filtrere ut målinger av en sensor brukes 
```
188.166.37.247:5000/api/v1/measurements/INSERT_GRUPPENR/?types=INSERT_TYPE,INSERT_TYPE
```
eller
```
188.166.37.247:5000/api/v1/measurements/INSERT_GRUPPENR/FROM_TIMESTAMP/TO_TIMESTAMP/?types=INSERT_TYPE,INSERT_TYPE
```

Der det kan settes inn så mange sensortyper som ønskelig for `INSERT_TYPE`<br/>


<br/>
URLen som benyttes i dette APIet kan hende endres i fremtiden til noe litt penere.
