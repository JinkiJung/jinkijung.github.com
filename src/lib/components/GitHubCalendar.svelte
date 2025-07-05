<script lang="ts">
  import { onMount } from 'svelte';
  import parse from 'github-calendar-parser';
  import elly from 'elly';
  import addSubtractDate from 'add-subtract-date';
  import formatoid from 'formatoid';

  export let username: string;
  export let summaryText: string = '';
  export let globalStats: boolean = true;
  export let responsive: boolean = true;
  export let tooltips: boolean = true;
  export let cache: number = 24 * 60 * 60; // 24 hours in seconds

  let container: HTMLElement;
  let loading = true;
  let error = false;

  const DATE_FORMAT1 = "MMM D, YYYY";
  const DATE_FORMAT2 = "MMMM D";
  const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function printDayCount(dayCount: number): string {
    return `${dayCount} ${(dayCount === 1) ? "day" : "days"}`;
  }

  function addTooltips(container: HTMLElement) {
    const tooltip = document.createElement("div");
    tooltip.classList.add("day-tooltip");
    container.appendChild(tooltip);

    // Add mouse event listener to show & hide tooltip
    const days = container.querySelectorAll(".js-calendar-graph-svg rect.ContributionCalendar-day");
    days.forEach((day: Element) => {
      day.addEventListener("mouseenter", (e: Event) => {
        const target = e.target as HTMLElement;
        let contribCount = target.getAttribute("data-count");
        if (contribCount === "0") {
          contribCount = "No contributions";
        } else if (contribCount === "1") {
          contribCount = "1 contribution";
        } else {
          contribCount = `${contribCount} contributions`;
        }
        const date = new Date(target.getAttribute("data-date") || '');
        const dateText = `${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
        tooltip.innerHTML = `<strong>${contribCount}</strong> on ${dateText}`;
        tooltip.classList.add("is-visible");
        const size = target.getBoundingClientRect();
        const leftPos = size.left + window.pageXOffset - tooltip.offsetWidth / 2 + size.width / 2;
        const topPos = size.bottom + window.pageYOffset - tooltip.offsetHeight - 2 * size.height;
        tooltip.style.top = `${topPos}px`;
        tooltip.style.left = `${leftPos}px`;
      });
      day.addEventListener("mouseleave", () => {
        tooltip.classList.remove("is-visible");
      });
    });
  }

  async function fetchGitHubCalendar() {
    try {
      loading = true;
      error = false;

      const options = {
        summary_text: summaryText || `Summary of pull requests, issues opened, and commits made by <a href="https://github.com/${username}" target="blank">@${username}</a>`,
        cache: cache * 1000,
        global_stats: globalStats,
        responsive: responsive,
        tooltips: tooltips
      };

      if (options.global_stats === false) {
        container.style.minHeight = "175px";
      }

      const cacheKeys = {
        content: `gh_calendar_content.${username}`,
        expire_at: `gh_calendar_expire.${username}`
      };

      // We need a proxy for CORS
      const proxy = (username: string) => {
        return fetch(`https://api.bloggify.net/gh-calendar/?username=${username}`).then(r => r.text());
      };

      const getCalendar = async (username: string) => {
        if (options.cache && Date.now() < +localStorage.getItem(cacheKeys.expire_at)) {
          const content = localStorage.getItem(cacheKeys.content);
          if (content) {
            return content;
          }
        }

        const body = await proxy(username);
        if (options.cache) {
          localStorage.setItem(cacheKeys.content, body);
          localStorage.setItem(cacheKeys.expire_at, Date.now() + options.cache);
        }
        return body;
      };

      const body = await getCalendar(username);
      let div = document.createElement("div");
      div.innerHTML = body;
      let cal = div.querySelector(".js-yearly-contributions");
      
      if (!cal) {
        throw new Error('Calendar not found');
      }

      elly(".position-relative h2", cal).remove();

      // Remove 3d visualiser div
      for (const a of div.querySelectorAll("a")) {
        if (a.textContent?.includes("View your contributions in 3D, VR and IRL!")) {
          a.parentElement?.remove();
        }
      }

      // If 'include-fragment' with spinner img loads instead of the svg, fetchCalendar again
      if (cal.querySelector("include-fragment")) {
        setTimeout(fetchGitHubCalendar, 500);
        return;
      }

      // If options includes responsive, SVG element has to be manipulated to be made responsive
      if (options.responsive === true) {
        let svg = cal.querySelector("table.js-calendar-graph-table") as HTMLElement;
        if (svg) {
          // Get the width/height properties and use them to create the viewBox
          let width = svg.getAttribute("width");
          let height = svg.getAttribute("height");
          // Remove height property entirely
          svg.removeAttribute("height");
          // Width property should be set to 100% to fill entire container
          svg.setAttribute("width", "100%");
          // Add a viewBox property based on the former width/height
          if (width && height) {
            svg.setAttribute("viewBox", "0 0 " + width + " " + height);
          }
        }
      }

      container.innerHTML = cal.innerHTML;

      // If options includes tooltips, add tooltips listeners to SVG
      if (options.tooltips === true) {
        addTooltips(container);
      }

      loading = false;
    } catch (e) {
      console.error('GitHub Calendar Error:', e);
      error = true;
      loading = false;
    }
  }

  onMount(() => {
    if (username) {
      fetchGitHubCalendar();
    }
  });

  // Watch for username changes
  $: if (username) {
    fetchGitHubCalendar();
  }
</script>

<div class="github-calendar-container" bind:this={container}>
  {#if loading}
    <div class="loading">Loading GitHub contributions...</div>
  {:else if error}
    <div class="error">Failed to load GitHub contributions</div>
  {:else}
    <!-- Calendar content will be inserted here -->
  {/if}
</div>

<style>
  .github-calendar-container {
    background: rgba(255, 255, 255, 0.05);
    padding: 2rem;
    border-radius: 10px;
    color: #fff;
  }

  .loading, .error {
    text-align: center;
    padding: 2rem;
    color: #888;
  }

  .error {
    color: #ff6b6b;
  }

  /* GitHub Calendar Styles */
  :global(.js-calendar-graph-table) {
    width: 100%;
    border-collapse: collapse;
  }

  :global(.js-calendar-graph-svg) {
    width: 100%;
    height: auto;
  }

  :global(.ContributionCalendar-day) {
    fill: #161b22;
    stroke: #0d1117;
  }

  :global(.ContributionCalendar-day[data-level="1"]) {
    fill: #0e4429;
  }

  :global(.ContributionCalendar-day[data-level="2"]) {
    fill: #006d32;
  }

  :global(.ContributionCalendar-day[data-level="3"]) {
    fill: #26a641;
  }

  :global(.ContributionCalendar-day[data-level="4"]) {
    fill: #39d353;
  }

  :global(.day-tooltip) {
    position: absolute;
    z-index: 1000;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  :global(.day-tooltip.is-visible) {
    opacity: 1;
  }

  :global(.contrib-column) {
    display: inline-block;
    vertical-align: top;
    margin-right: 20px;
    text-align: center;
  }

  :global(.contrib-number) {
    font-size: 24px;
    font-weight: bold;
    color: #fff;
  }

  :global(.text-muted) {
    color: #888;
    font-size: 12px;
  }
</style> 