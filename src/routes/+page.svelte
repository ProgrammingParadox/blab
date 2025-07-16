<link rel="stylesheet" href="../app.css">
<script lang="ts">
    import Space from './Space.svelte';
    import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

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

    function reloadsPDF(element: HTMLInputElement) {
        element.addEventListener('change', () => generatePDF());
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

    function toPts(value: number, unit: string) {
        switch (unit) {
            case 'mm':
                return value * 2.834645669;
            case 'in':
                return value * 72;
            case 'pt':
                return value;

            default:
                throw "Unknown unit: " + unit;
        }
    }

    interface PDFOptions {
        unit: string;

        width: number;
        height: number;

        fontSize: number;

        verticalPadding: number,
        horizontalPadding: number,
    }
    async function createPDF(options: PDFOptions) {
        let {
            unit,
            width, height,
            fontSize,
            verticalPadding, horizontalPadding
        } = options;

        // Convert size to PDF points (1 point = 1/72 inch)
        const widthpts  = toPts(width, unit);
        const heightpts = toPts(height, unit);

        const pdfDoc = await PDFDocument.create();
        const HelveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

        const pageSize = { x: 8.5 * 72, y: 11 * 72 };

        const page = pdfDoc.addPage([pageSize.x, pageSize.y]);

        const pagePadding = 0.5 * 72;

        // draw padding lines
        page.drawLine({
            start: { x: pagePadding, y: 0          },
            end  : { x: pagePadding, y: pageSize.y },

            thickness: 0.5,

            dashArray: [3, 3],
        });
        page.drawLine({
            start: { x: pageSize.x - pagePadding, y: 0          },
            end  : { x: pageSize.x - pagePadding, y: pageSize.y },

            thickness: 0.5,

            dashArray: [3, 3],
        });
        page.drawLine({
            start: { x: 0         , y: pagePadding },
            end  : { x: pageSize.x, y: pagePadding },

            thickness: 0.5,

            dashArray: [3, 3],
        });
        page.drawLine({
            start: { x: 0         , y: pageSize.y - pagePadding },
            end  : { x: pageSize.x, y: pageSize.y - pagePadding },

            thickness: 0.5,

            dashArray: [3, 3],
        });

        // Draw label border
        page.drawRectangle({
            x: pagePadding,
            y: pageSize.y - pagePadding,
            width: widthpts,
            height: - heightpts,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
        });

        // Draw text with automatic wrapping
        page.drawText(labelString(), {
        // page.drawText("Test\nOf\nMany\nLines", {
            x: pagePadding + horizontalPadding,
            y: pageSize.y - pagePadding - verticalPadding - HelveticaFont.heightAtSize(fontSize),
            size: fontSize,
            font: HelveticaFont,
            color: rgb(0, 0, 0),
            maxWidth: widthpts - horizontalPadding * 2,
            lineHeight: fontSize * 1.2,
        });

        return await pdfDoc.save();

        // download(await pdfDoc.save(), "bug_labels.pdf", "application/pdf");
    }

    let verticalPadding   = $state("5");
    let horizontalPadding = $state("5");
    function generatePDFData() {
        let unit = (new FormData(unitSelect)).get("unit");
        if (!unit) unit = "pt"; else unit = unit.toString();

        return createPDF({
            unit,

            width : parseFloat(widthInput ),
            height: parseFloat(heightInput),

            fontSize: parseFloat(fontSize),

            verticalPadding: parseFloat(verticalPadding),
            horizontalPadding: parseFloat(horizontalPadding),
        });
    }

    function downloadPDF() {
        generatePDFData()
            .then(data =>
                download(data, "bug_labels.pdf", "application/pdf")
            );
    }

    let unitSelect: HTMLFormElement;
    // $effect(() => {
    //     const inputs = unitSelect.querySelectorAll('input');
    //
    //     inputs.forEach(reloadsPDF);
    // });

    let fontSize = $state("5");

    let options: HTMLDivElement;
    $effect(() => {
        const inputs = options.querySelectorAll('input');

        inputs.forEach(reloadsPDF);
    });

    let widthInput = $state("1");
    let heightInput = $state("0.5");
    function generatePDF() {
        generatePDFData()
            .then(data => {
                let file = new Blob([data], {type: "application/pdf"});

                pdfIFrame.src = URL.createObjectURL(file);
            });
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
    let labelMenu: HTMLDivElement;
    let previewHolder: HTMLDivElement;
    let previewMenu: HTMLDivElement;
    function show(element: HTMLElement | HTMLElement[], display: string = 'flex') {
        if ('style' in element) {
            element.style.display = display;
        } else {
            element.forEach(e => show(e, display));
        }
    }
    function hide(element: HTMLElement | HTMLElement[]) {
        if ('style' in element) {
            element.style.display = "none";
        } else {
            element.forEach(hide);
        }
    }
    function showPreview(){
        if(!(labelHolder && previewHolder && pdfIFrame)) return;

        hide([labelHolder, labelMenu]);
        show([previewHolder, previewMenu]);

        generatePDF();
    }
    function hidePreview(){
        if(!(labelHolder && previewHolder)) return;

        show([labelHolder, labelMenu]);
        hide([previewHolder, previewMenu]);
    }

    // hotkeys
    addEventListener("keydown", (event) => {
        if (event.key == "Enter") showPreview();
        if (event.key == "Escape") hidePreview();
    })

    // $effect(hidePreview);

    // for testing
    // $effect(showPreview);
</script>

<div id="options">
    <div id="title">simple bug label generator</div>
<!--    <button id="print">print</button>-->
    <div id="preview-menu" class="menu" bind:this={previewMenu} style="display: none;">
        <button id="back" onclick={hidePreview}>back to editor</button>
        <button id="download" onclick={downloadPDF}>download</button>
    </div>
    <div id="label-menu" class="menu" bind:this={labelMenu}>
        <button id="export" onclick={showPreview}>export</button>
        <button id="export-text" onclick={exportAsText}>copy to clipboard</button>
    </div>
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
            <div id="label-options" bind:this={options}>
                <div class="row">
                    <div style="flex-grow: 2; align-items: center; margin-bottom: 10px;">
                        units
                    </div>
                    <form class="unit-select" bind:this={unitSelect}>
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
                    </form>
                </div>

                <div class="row">
                    <input
                            type="number"

                            size="5"
                            placeholder="width"

                            min="0"
                            step="0.01"

                            bind:value={widthInput}
                    />
                    <Space />
                    <div style="color: #AAA; flex-grow: 0;">x</div>
                    <Space />
                    <input
                            type="number"

                            size="5"
                            placeholder="height"

                            min="0"
                            step="0.01"

                            bind:value={heightInput}
                    />
                </div>

                <div class="row">
                    <label for="font-size">font size</label>
                    <input
                            style="flex-grow: 2;"
                            type="number"
                            id="font-size"

                            size="3"
                            placeholder="font size"

                            min="0"
                            step="1"

                            bind:value={fontSize}
                    />
                    <label for="font-size" style="flex: 0;">pt</label>
                </div>

                <div class="row">
                    <label for="padding">ver. pad</label>
                    <input
                            style="min-width: 3em; flex-grow: 0;"

                            id="padding-vertical"
                            type="number"

                            size="5"
                            placeholder="vertical padding"

                            min="0"
                            step="0.01"

                            bind:value={verticalPadding}
                    />
                </div>
                <div class="row">
                    <label for="padding">hor. pad</label>
                    <input
                            style="min-width: 3em; flex-grow: 0;"

                            id="padding-horizontal"
                            type="number"

                            size="5"
                            placeholder="horizontal padding"

                            min="0"
                            step="0.01"

                            bind:value={horizontalPadding}
                    />
                </div>
            </div>
        </div>
    </div>
</div>