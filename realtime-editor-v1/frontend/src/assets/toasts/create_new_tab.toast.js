import toast from "react-hot-toast";

export const toastNewTab = (tab) => {
    return new Promise((resolve, reject) => {
      toast((t) => (
        <div>
          <input id="tabName" type="text" placeholder="Enter Tab Name" />
          
          <select name="Type:" id="chooseType">
            <option value="xml">HTML</option>
            <option value="javascript">JS</option>
            <option value="babel">JS for React</option>
            <option value="css">CSS</option>
          </select>
  
          <button onClick={() => {
            let tabName = document.getElementById('tabName').value;
            if (tabName.length !== 0) {
                let type = document.getElementById('chooseType').value;
                tab.type = type;
                tab.title = tabName
              
                // Resolve the promise with the created tab
                resolve(tab);

                //dismiss
                toast.dismiss(t.id);
            }
            else {
              document.getElementById('tabName').placeholder = "Please enter a tab name!";
              document.getElementById('tabName').style = 'border: 2px solid red;';
            }
          }}>
            New
          </button>
        </div>
      ));
    });
}