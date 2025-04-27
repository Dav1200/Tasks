
//keep all functioanlity in js file for easy debugging
document.getElementById('searchTaskButton').addEventListener('click', getTaskById);
document.getElementById('submitform').addEventListener('click', createTask);

document.getElementById('refreshbtn').addEventListener('click', async function() {
  await initialLoad();
});
//open the overlay when the create task button clicked
document.getElementById('createTask').addEventListener('click', function() {

  document.getElementById('overlay').style.display = 'flex';

});

//close ubtton to close the overlay
document.getElementById('close').addEventListener('click', function() {
  document.getElementById('overlay').style.display = 'none';

});


//function to create a task, activated on submit button clied
  async function createTask(){
    event.preventDefault(); 
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const status = document.getElementById('status').value;
    const due = document.getElementById('duedate').value;

    if(title === '' || description === '' || status === '' || due === '') {
      alert('Please fill in all fields');
      return;
    }
  
    const response = await fetch('/api/createTask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, description, status, due })
    });
  
    const data = await response.json();
    if (response.status === 404) {
      alert('Task not found');
      return;
    }
 
    document.getElementById('overlay').style.display = 'none';
    alert('Task created');
    await initialLoad();
    console.log(data);
  } 

//get task by an id, 
  async function getTaskById() {
    const id = document.getElementById('searchInput').value.toString();
    if (id === '') {
      alert('Please enter a task ID');
     await initialLoad ();
      return;
    }
    const response = await fetch(`/api/getTaskbyid?id=${id}`);
    const data = await response.json();
    if (response.status === 404) {
      alert('Task not found');
      return;
    }

    list = [];
    list.push(data);
    await updateTable(list);
  }

  //get all tasks 
  async function getAllTasks() {
    const response = await fetch('/api/getAllTasks');
    const data = await response.json();
    if (response.status === 404) {
      console.log('No tasks found');
      return;
    }
    return data;
  }


  //updayte staus using id

  async function updateTask(id,status) {

    id = id.toString();
    status = status.toString();
    const response = await fetch(`/api/updateTask?id=${id}&status=${status}`, {
      method: 'PUT'
    });
    const data = await response.json();
    if (response.status === 404) {
      alert('Task not found');
      return;
    }
    console.log(data);



  }


  //delete task by id

  async function deleteTask(id) {
    id = id.toString();
    const response = await fetch(`/api/deleteTask?id=${id}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (response.status === 404) {
      alert('Task not found');
      return;
    }
    console.log(data);
  }



 
  async function updateTable(result){
    console.log(result);

    //clear the table before adding new data. 

    const table = document.getElementById('taskTableBody');
    table.innerHTML = ''; // Clear existing rows

    for(data of result){
      const row = document.createElement('tr');
      const idCell = document.createElement('td');
      const titleCell = document.createElement('td');
      const descriptionCell = document.createElement('td');
      const statusCell = document.createElement('td');
      const dueCell = document.createElement('td');
    const updatecell = document.createElement('td');
    const deletecell = document.createElement('td');

    console.log(data.id);
    



    //two buttons one to update and one to delete the task
    const updateButton = document.createElement('button');
    updateButton.innerText = 'Update';
    updateButton.addEventListener('click', function() {
      const newStatus = prompt('Enter new status:');
      if (newStatus) {
        updateTask(data.id, newStatus);
        statusCell.innerText = newStatus; 
      }
    });
    updatecell.appendChild(updateButton);

    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'Delete';
    deleteButton.addEventListener('click', function() {
      const confirmDelete = confirm('Confirm delete?');
      if (confirmDelete) {
        deleteTask(data.id);
        row.remove(); 
      }
    });
    deletecell.appendChild(deleteButton);



      idCell.innerText = data.id;
      titleCell.innerText = data.title;
      descriptionCell.innerText = data.description;
      statusCell.innerText = data.status;
      dueCell.innerText = data.due_date;





      row.appendChild(idCell);
      row.appendChild(titleCell);
      row.appendChild(descriptionCell);
      row.appendChild(statusCell);
      row.appendChild(dueCell);
      row.appendChild(updatecell);
      row.appendChild(deletecell);
      table.appendChild(row);
    }
   

  } 



  async function initialLoad() {
    const result =  await getAllTasks();
    console.log(result);
    updateTable(result);
  }

//updat on initial load of the pag , and make async function to for all tasks. 
window.onload = async function() {
  await initialLoad();
  }
