<script lang="ts">
  export let textHeight: HTMLElement;

  const MAX_CONTAINER_SIZE = 90;

  let isOpen = false;
  let accordingElement: HTMLDivElement;
  let container: HTMLDivElement;

  function accordion(node: HTMLDivElement, isOpen: boolean) {
    let initialHeight = node.offsetHeight;
    node.style.height = isOpen ? 'auto' : `${MAX_CONTAINER_SIZE}px`;
    node.style.webkitBoxOrient = isOpen ? 'unset' : 'vertical';
    node.style.webkitLineClamp = isOpen ? 'unset' : '3';
    node.style.overflow = 'hidden';
    return {
      update(isOpen: boolean) {
        let animation = node.animate(
          [
            {
              height: initialHeight + 'px',
              overflow: 'hidden',
            },
            {
              height: 0,
              overflow: 'hidden',
            },
          ],
          { duration: 100, fill: 'both' }
        );
        animation.pause();
        if (!isOpen) {
          animation.play();
        } else {
          animation.reverse();
        }
      },
    };
  }
</script>

<div bind:this={container} class="q-quiz-long-text">
  <div
    bind:this={accordingElement}
    class="q-quiz-long-text-content"
    style={textHeight?.offsetHeight > container?.offsetHeight
      ? `--MAX_CONTAINER_SIZE:${MAX_CONTAINER_SIZE}px`
      : 'height:unset'}
  >
    <slot />
  </div>
  {#if textHeight?.offsetHeight > container?.offsetHeight || isOpen}
    <button
      on:click={() => accordion(accordingElement, (isOpen = !isOpen))}
      class="q-quiz-long-text-read-more s-font-note"
      >{#if isOpen}Weniger{:else}Mehr{/if} anzeigen</button
    >
  {:else}
    Hier sollte ein Button sein {textHeight?.offsetHeight}
    {container?.offsetHeight}
    {isOpen}
  {/if}
</div>

<style lang="scss">
  .q-quiz-question-introduction {
    margin: 0;
    margin-bottom: 8px;
  }

  .q-quiz-long-text-content {
    height: var(--MAX_CONTAINER_SIZE);
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    text-overflow: ellipsis;
    transition: all 700ms ease-in-out;
  }

  .q-quiz-long-text-read-more {
    background: none;
    border: none;
    color: #2c32bd;
    cursor: pointer;
    margin: 0;
    padding: 0;
  }
</style>
