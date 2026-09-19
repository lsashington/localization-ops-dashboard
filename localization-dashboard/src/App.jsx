import { useEffect, useState } from "react";

function sortByTitle(items, field, ascending){
  const sorted = [...items].sort((a,b) => {
    if(ascending){
      return a[field].localeCompare(b[field]);
    }else{
      return b[field].localeCompare(a[field]);
    }
  });
  return sorted;
}



function App(){
  const [sortAscending, setSortAscending] = useState(true);
  const [sortColumn, setSortColumn] = useState("title");
  const [statusFilter, setStatusFilter] = useState("All");
  const [contentItems, setContentItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect (() => {
    const fetchData = async () => {
      try{
        const response = await fetch('http://localhost:3000/api/items');
        if(!response.ok){
          throw new Error(`HTTP error! Status ${response.status}`)
        }
        const data = await response.json();
        setContentItems(data);
      }catch(err){
        setError(err.message);
      }
      
    };
    fetchData();
  },[]);

  function handleSort(field){
    if(field === sortColumn){
     setSortAscending(!sortAscending);
    }else{
      setSortColumn(field);
      setSortAscending(true);
    }
  }

  function filterByStatus(items, status){
    if(status === "All"){
      return items;
    }else{
      return items.filter((item) => item.status === status)
    }
  }

  async function updateStatus(id, newStatus){
    console.log(id + " status changed to: " + newStatus);
    try{
      const response = await fetch(`http://localhost:3000/api/items/${id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({status: newStatus}),
      })
      if(!response.ok){
        throw new Error(`HTTP error! Status ${response.status}`)
      }
      setContentItems((prevItems) => prevItems.map((item) => item.id === id ? {...item, status: newStatus} : item));
    }catch(err){
      setError(err.message)
    };
  }
  
  return(
    <div>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <h1>Localization Dashboard</h1>
      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
        <option value="All">All</option>
        <option value="Ordered">Ordered</option>
        <option value="In Translation">In Translation</option>
        <option value="QA">QA</option>
        <option value="Delivered">Delivered</option>
      </select>
      <table>
        <thead>
        <tr>
          <th><button onClick={() => handleSort("title")}>Title</button></th>
          <th><button onClick={() => handleSort("status")}>Status</button></th>
          <th><button onClick={() => handleSort("vendor")}>Vendor</button></th>
        </tr>
        </thead>
        <tbody>
          {sortByTitle(filterByStatus(contentItems, statusFilter), sortColumn, sortAscending).map((item) => (
            <tr key={item.title}>
              <td>{item.title}</td>
              <td>
                <select value={item.status} onChange={(e) => {updateStatus(item.id, e.target.value)}}>
                  <option value="In Translation">In Translation</option>
                  <option value="Ordered">Ordered</option>
                  <option value="QA">QA</option>
                  <option value="Delivered">Delivered</option>                
                </select>
              </td>
              <td>{item.vendor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;