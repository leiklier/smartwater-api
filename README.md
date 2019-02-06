# Vannovervakning-api
Ett enkelt api(aplication programming interface) for å sende målinger fra [thethingsnetwork](https://www.thethingsnetwork.org/) med en POST-request til en database, og hente målingene igjen senere med en GET-request.

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


