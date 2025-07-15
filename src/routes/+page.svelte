<script lang="ts">
    import { SVG } from '@svgdotjs/svg.js'

    let scientificName = $state();
    let commonName     = $state();
    let family         = $state();
    let order          = $state();
    let location       = $state();
    let date           = $state();
    let collector      = $state();

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

    function toImg(){
        let svg = SVG().size(300, 200);
    }

    // who's gonna export as text? this is kinda very useless
    function exportAsText(){
        const str = `${scientificName} (${commonName    })\n`       +
                    `F: ${family        } O: ${order         }\n` +
                    `${location      }\n`                         +
                    `${date          } - ${collector     }`;

        navigator.clipboard.writeText(str).then(function() {
            alert("copied to clipboard!");
        }, function(err) {
            alert(err);
        });
    }
</script>

<div id="options">
    <div id="title">simple bug label generator</div>
<!--    <button id="print">print</button>-->
<!--    <button id="export">export</button>-->
    <button id="export-text" onclick={exportAsText}>copy to clipboard</button>
</div>

<div id="alerts">

</div>

<div id="label-holder">
    <div class="label">
        <div class="row">
            <input type="text" id="scientific-name" placeholder="Scientific Name" bind:value={scientificName}/>
            <span>(<input type="text" id="common-name" placeholder="Common Name" bind:value={commonName} />)</span>
        </div>
        <div class="row">
            <span>F: <input type="text" id="family" placeholder="Family" bind:value={family} /></span>
            <span>O: <input type="text" id="order" placeholder="Order" bind:value={order} /></span>
        </div>

        <input type="text" id="location" placeholder="Location" bind:value={location} />

        <div class="row">
            <input type="text" id="date" placeholder="Date" bind:value={date} />
            <input type="text" id="collector" placeholder="Collector" bind:value={collector} />
        </div>
    </div>
</div>