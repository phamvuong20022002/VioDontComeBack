import Swal from 'sweetalert2'; 


export const templateSaveCode = async() =>{
  const result = await Swal.fire({
    title: "Do you want to save your code?",
    icon: "question",
    iconColor: "#5271ff",
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: "Save",
    confirmButtonColor: "#004aad",
    denyButtonText: `Don't save`
  })

  return result; 
};


export const templateCloseTab = async () => {
  const result = await Swal.fire({
    title: "<strong>Are you sure?</strong>",
    icon: "warning",
    iconColor: "#FFD600",
    html: "Code in this tab will be removed!",
    showCancelButton: true,
    confirmButtonColor: "#004aad"
  });

  return result;
};

export const templateSaveRoomError = async(message) => {
  const result = await Swal.fire({
    icon: 'error',
    title: "Oops...",
    text: message,
    footer: '<a href="#">Why do I have this issue?</a>'
  });
  if(result.isConfirmed){
    return; 
  }
}

export const templateSaveRoomSuccess = async(navigator, roomId) => {
  await Swal.fire({
    title:"Saved!",
    icon: "success",
    html: 
    `Keep your RoomID <strong><u>${roomId}</u></strong> for the next accessing`,
    confirmButtonColor: "#004aad"
  })
  .then(() => {
    navigator(`/`);
  });
}