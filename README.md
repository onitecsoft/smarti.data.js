# smarti.data.js

JavaScript helper for data processing.

<b>Reference</b>

member | description | example
--- | --- | ---
`getter(property)` | returns getter function for any nested object property | `var getter = smarti.data.getter('Name');`<br/>`var name = getter(dataItem);<br/>getter = smarti.data.getter('Address.City');<br/>var city = getter(dataItem);`
