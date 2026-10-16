import { useEffect, useState } from "react";
import { API_URL } from "./apiConfig";
import { ContentItem, SortField } from "./types";
import type { SyntheticEvent } from "react"; 

function sortByTitle(items: ContentItem[], field: "title" | "status" | "vendor", ascending: boolean){
  const sorted = [...items].sort((a,b) => {
    if(ascending){
      return a[field].localeCompare(b[field]);
    }else{
      return b[field].localeCompare(a[field]);
    }
  });
  return sorted;
}

function filterByStatus(items: ContentItem[], status: string){
  if(status === "All"){
    return items;
  }else{
    return items.filter((item) => item.status === status)
  }
}

function App(){
  const [sortAscending, setSortAscending] = useState(true);
  const [sortColumn, setSortColumn] = useState<SortField>("title");
  const [statusFilter, setStatusFilter] = useState("All");
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Omit<ContentItem , "id">>({title:"", status: "QA", vendor: ""});

  useEffect (() => {
    const fetchData = async () => {
      try{
        const response = await fetch(`${API_URL}/api/items`);
        if(!response.ok){
          throw new Error(`HTTP error! Status ${response.status}`)
        }
        const data = await response.json();
        setContentItems(data);
      }catch(err){
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
      
    };
    fetchData();
  },[]);

  function handleSort(field: "title" | "status" | "vendor"){
    if(field === sortColumn){
     setSortAscending(!sortAscending);
    }else{
      setSortColumn(field);
      setSortAscending(true);
    }
  }



  async function updateStatus(id: number, newStatus: ContentItem["status"]){
    console.log(id + " status changed to: " + newStatus);
    try{
      const response = await fetch(`${API_URL}/api/items/${id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({status: newStatus}),
      })
      if(!response.ok){
        throw new Error(`HTTP error! Status ${response.status}`)
      }
      setContentItems((prevItems) => prevItems.map((item) => item.id === id ? {...item, status: newStatus} : item));
    }catch(err){
      setError(err instanceof Error ? err.message : "Something went wrong");
    };
  }

  async function deleteItem(id : number){
    try{
    const response = await fetch(`${API_URL}/api/items/${id}`, { method: "DELETE"});
    if(!response.ok){
        throw new Error(`HTTP error! Status ${response.status}`)
      }
      setContentItems((prevItems) => prevItems.filter((item) => item.id !== id));
    }catch(err){
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>){
    e.preventDefault();
    try{
      const response = await fetch(`${API_URL}/api/items` , {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(newItem)
      })

      if(!response.ok){
        throw new Error(`HTTP error! Create`)
      }
      
      const data = await response.json();
  
      setContentItems(prev => [...prev, data]);
      setNewItem({title:"", status: "QA", vendor: ""});
    }catch(err){
      setError(err instanceof Error ? err.message : "Could not submit")
    }
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
      <br></br>
      <form onSubmit={handleSubmit}>
      <label>Title</label>
      <input placeholder="Title" value={newItem.title} onChange={(e) => setNewItem(prev => ({...prev, title: e.target.value}))}></input>
      <label>Vendor</label>
      <input placeholder="Vendor" value={newItem.vendor} onChange={(e) => setNewItem(prev => ({...prev, vendor: e.target.value}))}></input>
      <label>Status</label>
      <select value={newItem.status} onChange={(e) => setNewItem(prev => ({...prev, status: e.target.value as ContentItem["status"]}))}>
        <option value="Ordered">Ordered</option>
        <option value="In Translation">In Translation</option>
        <option value="QA">QA</option>
        <option value="Delivered">Delivered</option>
      </select>
      <button type="submit">Add</button>
      </form>
      <table>
        <thead>
        <tr>
          <th><button onClick={() => handleSort("title")}>Title</button></th>
          <th><button onClick={() => handleSort("status")}>Status</button></th>
          <th><button onClick={() => handleSort("vendor")}>Vendor</button></th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
          {sortByTitle(filterByStatus(contentItems, statusFilter), sortColumn, sortAscending).map((item) => (
            <tr key={item.title}>
              <td>{item.title}</td>
              <td>
                <select value={item.status} onChange={(e) => {updateStatus(item.id, e.target.value as ContentItem["status"])}}>
                  <option value="In Translation">In Translation</option>
                  <option value="Ordered">Ordered</option>
                  <option value="QA">QA</option>
                  <option value="Delivered">Delivered</option>                
                </select>
              </td>
              <td>{item.vendor}</td>
              <td><button onClick={() => deleteItem(item.id)}>DELETE</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;