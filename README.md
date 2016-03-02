# smarti.data.js

JavaScript helper for data processing.

<b>Reference</b>

member | description | example
--- | --- | ---
`getter(property)` | returns getter function for any nested object property<br/>if property contains dot, use double backslash to escape it (`some\\.property`) | `var getter = smarti.data.getter('Name');`<br/>`var name = getter(dataItem);`<br/>`getter = smarti.data.getter('Address.City');`<br/>`getter = smarti.data.getter('some\\.property');`

<table>
  <tr>
    <th>member</th>
    <th>description</th>
    <th>example</th>
  </tr>
  <tr>
    <td>`getter(property)`</td>
    <td>returns getter function for any nested object property<br/>if property contains dot, use double backslash to escape it (`some\\.property`)</td>
    <td>`var getter = smarti.data.getter('Name');`<br/>`var name = getter(dataItem);`<br/>`getter = smarti.data.getter('Address.City');`<br/>`getter = smarti.data.getter('some\\.property');`</td>
  </tr>
</table>
