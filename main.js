/****************************************
 * Drag and Drop demonstration
 */

const { localFileSystem:fs, formats } = require("uxp").storage;

/*
 * Create the panel DOM
 */
function create() {
    var panel

    const HTML =
        `
        <style>
            [input-image-url] {
                width: 100%
            }
            [draggable-image] {
                width: 100px;
                cursor: pointer;
                margin:2px;
            }
        </style>
        
        <span>URL of image</span>
        <input input-image-url type="text" placeholder="https://" uxp-quiet="true"/>
        <footer>
            <button download-image-btn type="submit" uxp-variant="cta">Download Image</button>
        </footer>

        <div images-to-grag>
            
        </div>
        `

    panel = document.createElement("div")
    panel.innerHTML = HTML

    return panel
}

/*
 * Attach the panel UI to event.node, 
 * and create the logic of the plugin
 */ 
function show(event) {
    event.node.appendChild(create())

    // short way of using document.querySelector(...)
    const $ = sel => document.querySelector(sel)
    
    // check when a image is dragged
    document.addEventListener('dragstart', (e) => {
        // show the copy drag and drop effect 
        e.dataTransfer.dropEffect = "copy"
        // get image path from image attribute and paste it
        e.dataTransfer.setData("text/uri-list", e.target.getAttribute('img-temp-path'))
    })

    // checks when download image button is clicked
    $('[download-image-btn]').addEventListener('click', async () => {
        // get the value from image url input
        // make a request to that image, 
        // and get the binary response of it
        // and convert it to 8-bit unsigned integer
        // if you are dragging a .svg image, 
        // you have to create a btoa polyfill and 
        // convert the binary to base64 and then save it as "data:image/svg+xml;base64..." 
        const url = $('[input-image-url]').value
        const response = await fetch(url, 
            {"Content-Type": "image/jpeg"}
        )
        const binary = await response.arrayBuffer()
        const imageArray = new Uint8Array(binary)
        
        // here we are writing the file to the temporary storage
        const tempFolder = await fs.getTemporaryFolder()
        const imageFile = await tempFolder.createFile(`image-${imageArray.length}.jpg`, {
            overwrite: true
        })
        await imageFile.write(imageArray, {
            format: formats.binary
        })

        addImageToUI(url, imageFile)
    })

    /*
     * Append image to the UI, and initialize the drag
     * we also created a attribute to store the 
     * path of this image (we need this when draggind and dropping)
     */
    function addImageToUI(url, imageFile){
        
        const img = document.createElement('img')
        img.setAttribute('draggable-image', '')
        img.setAttribute('src', url)
        img.setAttribute('draggable', 'true')
        img.setAttribute('img-temp-path', imageFile.nativePath)
        $('[images-to-grag]').appendChild(img)
        // clean the url input value 
        url.value = ''
    }

}

module.exports = {
    panels: {
        UI: {
            show
        }
    }
}
