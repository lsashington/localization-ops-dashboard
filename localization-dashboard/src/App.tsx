import { useEffect, useState } from "react";
import { API_URL } from "./apiConfig";
import { ContentItem, SortField } from "./types";
import type { SyntheticEvent } from "react"; 
import { getRisk, RISK_RANK } from "./risk";
import { RISK_STYLE } from "./riskStyle";
import { AlertTriangle } from "lucide-react";

function sortByTitle(items: ContentItem[], field: SortField, ascending: boolean){
  const sorted = [...items].sort((a,b) => {
    if(field === "dueDate"){
      if(a.dueDate === null && b.dueDate === null) return 0
      if(a.dueDate === null) return 1;
      if(b.dueDate === null) return -1;

      const aTime = new Date(a.dueDate).getTime();
      const bTime = new Date(b.dueDate).getTime();
      return ascending ? aTime - bTime : bTime - aTime;
    }

    if(field === "risk"){
      const aRank = RISK_RANK[getRisk(a.dueDate, a.status)];
      const bRank = RISK_RANK[getRisk(b.dueDate, b.status)];
      if(aRank >= 3 || bRank >= 3) return aRank - bRank;
      return ascending ? aRank - bRank : bRank - aRank;
    }    

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
  const [newItem, setNewItem] = useState<Omit<ContentItem , "id">>({title:"", status: "QA", vendor: "", dueDate: null});

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

  function handleSort(field: SortField){
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
      });     
      
      const data = await response.json();

      if(!response.ok){
        data.message ?? "Could not create item";
        throw new Error(data.message);
      }
    
      setContentItems(prev => [...prev, data]);
      setNewItem({title:"", status: "QA", vendor: "", dueDate: ""});
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
      <input placeholder="Title" value={newItem.title} onChange={(e) => setNewItem(prev => ({...prev, title: e.target.value}))} required></input>
      <label>Vendor</label>
      <input placeholder="Vendor" value={newItem.vendor} onChange={(e) => setNewItem(prev => ({...prev, vendor: e.target.value}))} required></input>
      <label>Status</label>
      <select value={newItem.status} onChange={(e) => setNewItem(prev => ({...prev, status: e.target.value as ContentItem["status"]}))}>
        <option value="Ordered">Ordered</option>
        <option value="In Translation">In Translation</option>
        <option value="QA">QA</option>
        <option value="Delivered">Delivered</option>
      </select>
      <label>Due Date</label>
      <input placeholder="XX/XX/XXXX" type="date" value={newItem.dueDate ?? ""} onChange={(e) => setNewItem(prev => ({...prev, dueDate: e.target.value}))}></input>
      <button type="submit">Add</button>
      </form>
      <table>
        <thead>
        <tr>
          <th><button onClick={() => handleSort("title")}>Title</button></th>
          <th><button onClick={() => handleSort("status")}>Status</button></th>
          <th><button onClick={() => handleSort("vendor")}>Vendor</button></th>
          <th><button onClick={() => handleSort("dueDate")}>Due</button></th>
          <th><button onClick={() => handleSort("risk")}>Risk</button></th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
          {sortByTitle(filterByStatus(contentItems, statusFilter), sortColumn, sortAscending).map((item) => {
            const risk = getRisk(item.dueDate, item.status);
            const {Icon, label} = RISK_STYLE[risk];
            return(
            <tr key={item.id}>
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
              <td>{item.dueDate ? new Date(item.dueDate).toLocaleDateString("en-US", {timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit'}) : "-"}</td>
              <td><span className={`badge badge-${risk}`}><Icon size={14}/>{label}</span></td>
              <td><button onClick={() => deleteItem(item.id)}>DELETE</button></td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default App;