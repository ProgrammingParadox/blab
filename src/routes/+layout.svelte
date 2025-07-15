<!-- On second thought, this is probably useless for a virtually single-page app -->

<script>
    import '../app.css';

    let { children } = $props();
</script>

<div class="app">
    <main>
        {@render children()}
    </main>
</div>