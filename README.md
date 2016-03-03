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
    <td><b>getter(property)</b></td>
    <td>returns value getter function for any nested object property<br/>if property name contains dot, use double backslash to escape it (<code>some\\.property</code>)</td>
  </tr>
  <tr>
    <td colspan="2">
<pre lang="javascript">
var getter = smarti.data.getter('Name');
var name = getter(dataItem);
getter = smarti.data.getter('Address.City');
getter = smarti.data.getter('some\\.property');
</pre>
    </td>
  </tr>
  <tr>
    <td><b>get(property, dataItem)</b></td>
    <td>returns value of any nested object property</td>
  </tr>
  <tr>
    <td colspan="2">
      <pre lang="javascript">var name = smarti.data.get('Name', dataItem);</pre>
    </td>
  </tr>
  <tr>
    <td><b>sort(data, options)</b></td>
    <td>sort an array of primitive values or complex objects<br/><code>options</code> represents sorting fields, methods and directions (can be <code>string</code>, <code>object</code> with structure: { field:'...', method:function(dataItem){ return ... }, dir:'asc | desc' } or <code>array</code> of objects)<br/>method changes the original array</td>
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
//sort by field 'name'
smarti.data.sort(data, { field:'name' });
//multi field sort
smarti.data.sort(data, [{ field:'name' }, { field:'id', dir:'desc' }]);
//sort by string representation of 'id' field
smarti.data.sort(data, { method:function(e){ return e.id.toString() } });
</pre>
    </td>
  </tr>
  <tr>
    <td><b>filter(data, filters)</b></td>
    <td>returns filtered data<br/><code>filters</code> - condition or array of conditions represented by functions (can have named indexes)<br/>conditions are concatenated with <code>&&</code> operator</td>
  </tr>
  <tr>
    <td colspan="2">
<pre lang="javascript">
var data = [
            { id:1, name:'a' },
            { id:2, name:'a' },
            { id:3, name:'b' }
          ];
var filteredData = smarti.data.filter(data, function(e){ return e.id > 1; });
var filteredData = smarti.data.filter(data, { filter1:function(e){ return e.id > 1; } });
var filteredData = smarti.data.filter(data, [
  function(e){ return e.id == 1; },
  function(e){ return e.name == 'a'; }
]);
</pre>
    </td>
  </tr>
  <tr>
    <td><b>contains(str, substr, cs)</b></td>
    <td>returns whether string contains substring<br/><code>cs</code> - case sensitive (<code>true</code> | <code>false</code>)<br/>accepts any data type (arguments are converted <code>toString()</code>)</td>
  </tr>
  <tr>
    <td colspan="2">
<pre lang="javascript">
var contains1 = smarti.data.contains('TEST', 't'); //returns true;
var contains2 = smarti.data.contains('TEST', 't', true); //returns false;
var contains3 = smarti.data.contains(new Date('2016-1-1'), 2016) //returns true;
</pre>
    </td>
  </tr>
  <tr>
    <td><b>starts(str, substr, cs)</b></td>
    <td>returns whether string starts with substring<br/><code>cs</code> - case sensitive (<code>true</code> | <code>false</code>)<br/>accepts any data type (arguments are converted <code>toString()</code>)</td>
  </tr>
  <tr>
    <td colspan="2">
<pre lang="javascript">
var starts1 = smarti.data.starts('TEST', 't'); //returns true;
var starts2 = smarti.data.starts('TEST', 't', true); //returns false;
var starts3 = smarti.data.starts(new Date('2016-1-1'), 2016) //returns false;
</pre>
    </td>
  </tr>
  <tr>
    <td><b>ends(str, substr, cs)</b></td>
    <td>returns whether string ends with substring<br/><code>cs</code> - case sensitive (<code>true</code> | <code>false</code>)<br/>accepts any data type (arguments are converted <code>toString()</code>)</td>
  </tr>
  <tr>
    <td colspan="2">
<pre lang="javascript">
var ends1 = smarti.data.ends('TEST', 't'); //returns true;
var ends2 = smarti.data.ends('TEST', 't', true); //returns false;
var ends3 = smarti.data.ends(new Date('2016-1-1'), 2016) //returns false;
</pre>
    </td>
  </tr>
</table>
