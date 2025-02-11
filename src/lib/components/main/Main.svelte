<script lang="ts">
     import * as Card from "$lib/components/ui/card/index.js";
</script>

<main class="flex min-h-[calc(100vh-64px)] w-full flex-col justify-between bg-muted/40">
    <Card.Root>
        <Card.Header>
          <Card.Title>Card Title</Card.Title>
          <Card.Description>Card Description</Card.Description>
        </Card.Header>
        <Card.Content>
          <p>Card Content</p>
        </Card.Content>
        <Card.Footer>
          <p>Card Footer</p>
        </Card.Footer>
      </Card.Root>
</main>