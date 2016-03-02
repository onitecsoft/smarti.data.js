# smarti.data.js

JavaScript helper for data processing.

<b>Reference</b>

<table>
  <tr>
    <th>member</th>
    <th>description</th>
    <th>example</th>
  </tr>
  <tr>
    <td>`getter(property)`</td>
    <td>returns getter function for any nested object property<br/>if property contains dot, use double backslash to escape it (`some\\.property`)</td>
    <td>
      ```javascript
      var getter = smarti.data.getter('Name');
      var name = getter(dataItem);
      getter = smarti.data.getter('Address.City');
      getter = smarti.data.getter('some\\.property');
      ```
    </td>
  </tr>
</table>
