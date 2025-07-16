<script lang="ts">
    import Space from './Space.svelte';
    import {PDFDocument, StandardFonts} from 'pdf-lib'

    let scientificName = $state();
    let commonName     = $state();
    let family         = $state();
    let order          = $state();
    let location       = $state();
    let date           = $state();
    let collector      = $state();

    function labelString(): string {
        return `${scientificName} (${commonName})\n` +
               `F: ${family} O: ${order}\n`          +
               `${location}\n`                       +
               `${date} - ${collector}`              ;
    }

    // not very robust, but whatever
    function alert(text: string){
        let ae = document.createElement("div");
        ae.className = "alert";
        ae.innerHTML = text;

        let alerts = document.getElementById("alerts");
        alerts?.appendChild(ae);

        setTimeout(function(){
            ae.style.opacity = "0";
        }, 4800);

        setTimeout(function(){
            alerts?.removeChild(ae);
        }, 5000);
    }

    // https://stackoverflow.com/a/30832210
    function download(data: any, filename: string, type: string) {
        let file = new Blob([data], {type: type});

        let a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }

    async function createPDF(unit: string, width: number, height: number) {
        // Convert size to PDF points (1 point = 1/72 inch)
        const widthpts  = unit === 'mm' ? width * 2.834645669 : width * 72;
        const heightpts = unit === 'mm' ? height * 2.834645669 : height * 72;

        const pdfDoc = await PDFDocument.create();
        const HelveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

        const page = pdfDoc.addPage([8.5 * 72, 11 * 72]);

        return await pdfDoc.save();

        // download(pdfBytes, "bug_labels.pdf", "application/pdf");
    }

    // who's gonna export as text? this is kinda very useless
    function exportAsText(){
        const str = labelString();

        navigator.clipboard.writeText(str).then(function() {
            alert("copied to clipboard!");
        }, function(err) {
            alert(err);
        });
    }

    let pdfIFrame: HTMLIFrameElement;
    let labelHolder: HTMLDivElement;
    let previewHolder: HTMLDivElement;
    function showPreview(){
        if(!(labelHolder && previewHolder && pdfIFrame)) return;

        labelHolder.style.display = "none";
        previewHolder.style.display = "flex";

        createPDF("in", 1, 0.5)
            .then(data => {
                let file = new Blob([data], {type: "application/pdf"});

                pdfIFrame.src = URL.createObjectURL(file);
            });


    }
    function hidePreview(){
        if(!(labelHolder && previewHolder)) return;

        labelHolder.style.display = "flex";
        previewHolder.style.display = "none";
    }

    // for testing
    // $effect(showPreview);
</script>

<div id="options">
    <div id="title">simple bug label generator</div>
<!--    <button id="print">print</button>-->
    <button id="export" onclick={showPreview}>export</button>
    <button id="export-text" onclick={exportAsText}>copy to clipboard</button>
</div>

<div id="alerts">

</div>

<div id="label-center">
    <div id="label-holder" bind:this={labelHolder}>
        <div class="label">
            <div class="row">
                <input size="15" type="text" id="scientific-name" placeholder="Scientific Name" bind:value={scientificName}/>
                <Space />
                <span>(<input size="15" type="text" id="common-name" placeholder="Common Name" bind:value={commonName} />)</span>
            </div>
            <div class="row">
                <span>F: <Space /> <input size="15" type="text" id="family" placeholder="Family" bind:value={family} /></span>
                <Space />
                <span>O: <Space /> <input size="15" type="text" id="order" placeholder="Order" bind:value={order} /></span>
            </div>

            <div class="row">
                <input type="text" id="location" placeholder="Location" bind:value={location} />
            </div>

            <div class="row">
                <input size="15" type="text" id="date" placeholder="Date" bind:value={date} />
                <input size="15" type="text" id="collector" placeholder="Collector" bind:value={collector} />
            </div>
        </div>
    </div>

    <div id="preview-holder" bind:this={previewHolder}>
        <div id="label-preview">
            <iframe bind:this={pdfIFrame} title="PDF preview" id="pdf-preview"></iframe>
        </div>

        <div id="label-options-holder">
            <div id="label-options">
                <div class="row">
                    <div style="flex-grow: 2;">
                        units
                    </div>
                    <div class="unit-select">
                        <div>
                            <input type="radio" id="unit-in" value="in" name="unit" checked>
                            <label for="unit-in">in</label>
                        </div>

                        <div>
                            <input type="radio" id="unit-mm" value="mm" name="unit">
                            <label for="unit-mm">mm</label>
                        </div>

                        <div>
                            <input type="radio" id="unit-pt" value="pt" name="unit">
                            <label for="unit-pt">pt</label>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <input type="number" size="5" placeholder="width" min="0" step="0.01" value="1"/>
                    <Space />
                    <div style="color: #AAA; flex-grow: 0;">x</div>
                    <Space />
                    <input type="number" size="5" placeholder="height" min="0" step="0.01" value="0.5"/>
                </div>
            </div>
        </div>
    </div>
</div>