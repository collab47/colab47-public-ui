<script lang="ts">
  import { page } from '$app/stores';
  import { ApiError } from '$lib/api/client';
  import { badgesApi, type UserBadgesSummary } from '$lib/api/badges.api';
  import { profileApi } from '$lib/api/profile.api';
  import type { FullProfile } from '$lib/api/types';
  import { t } from '$lib/stores';
  import { Alert, Avatar, Badge, BadgesShowcase, Button, Card, Footer, Spinner } from '$ui';

  let profile = $state<FullProfile | null>(null);
  let publicBadges = $state<UserBadgesSummary | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);

  $effect(() => {
    const handle = $page.params.handle;
    if (!handle) return;
    loading = true;
    error = null;
    Promise.all([
      profileApi.getPublicProfile(handle),
      badgesApi.getPublicBadgesByHandle(handle).catch(() => null),
    ])
      .then(([data, badges]) => {
        profile = data;
        publicBadges = badges;
      })
      .catch((err) => {
        error = err instanceof ApiError ? err.message : 'Unable to load public profile.';
        profile = null;
        publicBadges = null;
      })
      .finally(() => {
        loading = false;
      });
  });
</script>

<svelte:head>
  <title>{profile ? `${profile.name} (@${profile.handle})` : 'Portfolio'} · Collab47</title>
</svelte:head>

<main class="c47-container public-profile">
  {#if loading}
    <div class="public-profile__center">
      <Spinner label={$t.portfolio.loading} size="lg" />
    </div>
  {:else if error || !profile}
    <div class="public-profile__center">
      <Alert tone="error" title={$t.portfolio.unavailable}>{error ?? 'Profile not found.'}</Alert>
      <Button variant="outline" href="/">{$t.portfolio.backToHome}</Button>
    </div>
  {:else}
    <div class="public-profile__stack">
      <Card surface="paper" padding="lg" elevated>
        <div class="hero-card">
          <Avatar name={profile.name} src={profile.avatarUrl} size="lg" />
          <div class="hero-card__meta">
            <div class="hero-card__top">
              <h1>{profile.name}</h1>
              {#if profile.roles && profile.roles.length > 0}
                {#each profile.roles as role (role.roleId)}
                  <Badge tone={role.isPrimary ? 'saffron' : 'neutral'}>
                    {role.badgeLabel ?? role.roleName}
                  </Badge>
                {/each}
              {:else}
                <Badge tone="saffron">{profile.accountType}</Badge>
              {/if}
              {#if profile.openToCollaborations}
                <Badge tone="moss">{$t.portfolio.openToCollabs}</Badge>
              {/if}
            </div>
            <p class="handle">@{profile.handle}</p>
            {#if profile.headline}
              <p class="headline">{profile.headline}</p>
            {/if}
            <p class="submeta">
              {[profile.college, profile.branch, profile.city].filter(Boolean).join(' · ')}
            </p>
          </div>
        </div>
      </Card>

      {#if publicBadges && publicBadges.earnedCount > 0}
        <Card title="Badges &amp; Achievements" subtitle="Level {publicBadges.level} · {publicBadges.levelTitle} ({publicBadges.totalPoints} pts)">
          <BadgesShowcase summary={publicBadges} publicOnly />
        </Card>
      {/if}

      {#if profile.bio || profile.professionalSummary}
        <Card title={$t.portfolio.about}>
          {#if profile.bio}
            <p class="body-text">{profile.bio}</p>
          {/if}
          {#if profile.professionalSummary}
            <p class="body-text summary">{profile.professionalSummary}</p>
          {/if}
        </Card>
      {/if}

      {#if profile.expertise.broadDomains.length > 0 || profile.skills.length > 0}
        <Card title={$t.portfolio.expertiseAndSkills}>
          {#if profile.expertise.broadDomains.length > 0}
            <div class="tag-group">
              <h4>{$t.portfolio.broadDomains}</h4>
              <div class="tags">
                {#each profile.expertise.broadDomains as dom (dom.broadDomainId)}
                  <Badge tone={dom.isPrimary ? 'saffron' : 'neutral'}>{dom.label}</Badge>
                {/each}
              </div>
            </div>
          {/if}
          {#if profile.skills.length > 0}
            <div class="tag-group">
              <h4>{$t.portfolio.skills}</h4>
              <div class="tags">
                {#each profile.skills as skill (skill.id)}
                  <Badge tone="moss">{skill.skillName}</Badge>
                {/each}
              </div>
            </div>
          {/if}
        </Card>
      {/if}

      {#if profile.education.length > 0}
        <Card title={$t.portfolio.education}>
          <div class="list-stack">
            {#each profile.education as edu (edu.id)}
              <div class="list-item">
                <strong>{edu.degree} — {edu.fieldOfStudy}</strong>
                <span>{edu.institution}</span>
                <small>
                  {edu.startYear ?? ''} – {edu.currentlyStudying ? 'Present' : (edu.endYear ?? '')}
                  {edu.grade ? ` · ${edu.grade}` : ''}
                </small>
              </div>
            {/each}
          </div>
        </Card>
      {/if}

      {#if profile.experiences.length > 0}
        <Card title={$t.portfolio.experience}>
          <div class="list-stack">
            {#each profile.experiences as exp (exp.id)}
              <div class="list-item">
                <strong>{exp.title}</strong>
                <span>{exp.organization}{exp.location ? ` · ${exp.location}` : ''}</span>
                <small>
                  {exp.startYear ?? ''} – {exp.currentlyWorkingHere ? 'Present' : (exp.endYear ?? '')}
                </small>
                {#if exp.description}
                  <p class="body-text">{exp.description}</p>
                {/if}
              </div>
            {/each}
          </div>
        </Card>
      {/if}

      {#if profile.socialLinks.length > 0}
        <Card title={$t.portfolio.socialLinks}>
          <div class="tags">
            {#each profile.socialLinks as link (link.id)}
              <Button variant="outline" size="sm" href={link.url}>{link.label}</Button>
            {/each}
          </div>
        </Card>
      {/if}
    </div>
  {/if}
</main>

<Footer />

<style>
  .public-profile {
    padding: 2.5rem 1.25rem;
    flex: 1;
  }

  .public-profile__center {
    min-height: 50vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  .public-profile__stack {
    max-width: 840px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .hero-card {
    display: flex;
    gap: 1.25rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .hero-card__meta {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .hero-card__top {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.55rem;
  }

  .hero-card__top h1 {
    font-family: var(--font-display);
    font-size: 1.85rem;
  }

  .handle,
  .submeta {
    color: var(--c47-ash);
    font-size: 0.9rem;
  }

  .headline {
    font-weight: 600;
    color: var(--c47-ink-soft);
  }

  .body-text {
    font-size: 0.94rem;
    color: var(--c47-ink-soft);
  }

  .summary {
    margin-top: 0.75rem;
    white-space: pre-wrap;
  }

  .tag-group + .tag-group {
    margin-top: 1.15rem;
  }

  .tag-group h4 {
    font-size: 0.85rem;
    color: var(--c47-ash);
    margin-bottom: 0.5rem;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .list-stack {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .list-item {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding-bottom: 0.85rem;
    border-bottom: 1px solid var(--c47-bone);
  }

  .list-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .list-item span {
    font-size: 0.92rem;
    color: var(--c47-ink-soft);
  }

  .list-item small {
    font-size: 0.8rem;
    color: var(--c47-ash);
  }
</style>
