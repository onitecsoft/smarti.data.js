# smarti.data.js

JavaScript helper for data processing.

<b>Reference</b>

<table>
  <thead>
    <tr>
      <th>member</th>
      <th>description</th>
    </tr>
  </thead>
  <tr>
    <td><code>getter(property)</code></td>
    <td>returns value getter function for any nested object property<br/>if property name contains dot, use double backslash to escape it (<code>some\\.property</code>)</td>
  </tr>
  <tr>
    <td colspan="2">
<pre lang="javascript">var getter = smarti.data.getter('Name');
var name = getter(dataItem);
getter = smarti.data.getter('Address.City');
getter = smarti.data.getter('some\\.property');</pre>
    </td>
  </tr>
  <tr>
    <td><code>get(property, dataItem)</code></td>
    <td>returns value for any nested object property</td>
  </tr>
  <tr>
    <td colspan="2">
      <pre lang="javascript">var name = smarti.data.get('Name', dataItem);</pre>
    </td>
  </tr>
  <tr>
    <td><code>sort(data, options)</code></td>
    <td>sort an array of primitive or complex objects<br/>options represents sorting fields, methods and directions</td>
  </tr>
  <tr>
    <td colspan="2">
<pre lang="javascript">
var data = [3,7,1,5];
smarti.data.sort(data); //sort ascending
smarti.data.sort(data, 'desc'); //descending
data = [
        { id:1, name:'a' },
        { id:2, name:'a' },
        { id:3, name:'b' }
      ];
smarti.data.sort(data, { field:'name' });
smarti.data.sort(data, [{ field:'name' }, { field:'id', dir:'desc' }]);
smarti.data.sort(data, { method:function(e){ return e.id.toString() } });
</pre>
    </td>
  </tr>
  <tr>
    <td><code>filter(data, filters)</code></td>
    <td></td>
  </tr>
  <tr>
    <td><code>contains(str, substr, cs)</code></td>
    <td></td>
  </tr>
  <tr>
    <td><code>starts(str, substr, cs)</code></td>
    <td></td>
  </tr>
  <tr>
    <td><code>ends(str, substr, cs)</code></td>
    <td></td>
  </tr>
</table>
