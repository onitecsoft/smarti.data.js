# smarti.data.js

JavaScript helper for data processing.

<b>Reference</b>

member | description | example
--- | --- | ---
`getter(property)` | returns getter function for any nested object  | ```javascript
                   | property                                       | var getter = smarti.data.getter('Name');
                   | if property contains dot, use double backslash | var name = getter(dataItem);
                   | to escape it (`some\\.property`)               | getter = smarti.data.getter('Address.City');
                   |                                                | getter = smarti.data.getter('some\\.property');
                   |                                                | ```
