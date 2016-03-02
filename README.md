# smarti.data.js

JavaScript helper for data processing.

<b>Reference</b>

member | description | example
--- | --- | ---
`getter(property)` | returns getter function for any nested object property | ```javascript
var getter = smarti.data.getter('Name');\nvar name = getter(dataItem);
getter = smarti.data.getter('Address.City');
getter = smarti.data.getter('some\\.property');
```
