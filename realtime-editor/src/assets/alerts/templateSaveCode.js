import Swal from 'sweetalert2'; 


export const templateSaveCode = (reactNavigator) =>{
    Swal.fire({
        title: "Do you want to SAVE your code?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Save",
        denyButtonText: `Don't save`
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          Swal.fire("Saved!", "", "success").then(() => {
            reactNavigator('/');
          });
        } else if (result.isDenied) {
          Swal.fire("Your code are not saved", "", "info").then(() => {
            reactNavigator('/');
          });
        }
      }).then(() =>{
        return;
      });
};


export const templateCloseTab = async () => {
  const result = await Swal.fire({
    title: "<strong>Are you sure?</strong>",
    icon: "warning",
    html: "Code in this tab will be removed!",
    showCancelButton: true,
    denyButtonText: "Close tab",
  });

  return result;
};