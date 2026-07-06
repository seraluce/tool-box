import * as cheerio from 'cheerio';

export interface ProfileData {
  gameCount: string;
  groupCount: string;
  badgeIconUrl: string;
  groupIconList: string[];
  screenshotCount: string;
  artWorkCount: string;
  reviewCount: string;
  guideCount: string;
  badgeCount: string;
  playerLevel: string;
  avatarUrl: string;
}

export function crawler(html: string): ProfileData {
  const $ = cheerio.load(html);

  let gameCount = '0';
  let screenshotCount = '0';
  let artWorkCount = '0';
  let reviewCount = '0';
  let guideCount = '0';
  let badgeCount = '0';

  const groupIconList: string[] = [];
  $('.profile_group_links')
    .children()
    .last()
    .children()
    .each((_i, el) => {
      const groupIconUrl = $(el).children().first().children().children().attr('src') as string;
      if (groupIconUrl) groupIconList.unshift(groupIconUrl);
    });

  let groupCount = $('.profile_group_links')
    .children()
    .first()
    .children()
    .find('.profile_count_link_total')
    .text();

  groupCount = groupCount.toString().replaceAll('\n', '').replaceAll('\t', '').trim();

  const badgeIconUrl = ($('.favorite_badge_icon').children().attr('src') || '') as string;

  $('.count_link_label').each((_i, el) => {
    const itemName = $(el).text().trim();
    let count = $(el).next().text().toString().replaceAll('\n', '').replaceAll('\t', '').trim();

    switch (itemName) {
      case 'Games':
        gameCount = count;
        break;
      case 'Screenshots':
        screenshotCount = count;
        break;
      case 'Artwork':
        artWorkCount = count;
        break;
      case 'Reviews':
        reviewCount = count;
        break;
      case 'Guides':
        guideCount = count;
        break;
      case 'Badges':
        badgeCount = count;
        break;
    }
  });

  const playerLevel = $('.persona_name,.persona_level').find('.friendPlayerLevelNum').text().trim();

  const avatarUrl = $('.playerAvatarAutoSizeInner').children().last().find('img').attr('srcset') ||
    $('.playerAvatarAutoSizeInner').children().last().find('img').attr('src') || '';

  return {
    gameCount,
    groupCount,
    badgeIconUrl,
    groupIconList,
    screenshotCount,
    artWorkCount,
    reviewCount,
    guideCount,
    badgeCount,
    playerLevel,
    avatarUrl,
  };
}
