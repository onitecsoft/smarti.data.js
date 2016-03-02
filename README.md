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
    <td><code>getter(property)</code></td>
    <td>returns getter function for any nested object property<br/>if property contains dot, use double backslash to escape it (<code>some\\.property</code>)</td>
    <td>
<pre lang="javascript">var getter = smarti.data.getter('Name');
var name = getter(dataItem);
getter = smarti.data.getter('Address.City');
getter = smarti.data.getter('some\\.property');</pre>
    </td>
  </tr>
  <tr>
    <td><code>get(property, dataItem)</code></td>
    <td>returns value of dataItem corresponding to property name</td>
    <td><pre lang="javascript">var name = smarti.data.get(dataItem, 'Name');</pre></td>
  </tr>
</table>
