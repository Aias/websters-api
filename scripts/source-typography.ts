import type { CheerioAPI } from 'cheerio';

export function normalizeSourceTypography($: CheerioAPI): void {
  $('*')
    .contents()
    .each((_, node) => {
      if (node.type === 'text') node.data = node.data.replace(/oo([\u035d\u035e])/g, 'o$1o');
    });
  $('.exp, .sups, .subs').each((_, element) => {
    element.tagName = $(element).hasClass('subs') ? 'sub' : 'sup';
  });
  $('.chform')
    .contents()
    .each((_, node) => {
      if (node.type === 'text') $(node).replaceWith($.html(node).replace(/\d+/g, '<sub>$&</sub>'));
    });

  $('.table, .mtable').each((_, table) => {
    const $table = $(table);
    const rows = $table.find('.tr, .row, .headrow').toArray();
    const structured =
      rows.length > 0 &&
      $table.find('.td, .th, .headrow').length > 0 &&
      rows.every((row) => $(row).find('.td, .th, .item').length > 0);
    if (!structured) {
      table.tagName = 'pre';
      $table.find('.pre').each((_, element) => {
        $(element).replaceWith($(element).contents());
      });
      return;
    }

    table.tagName = 'table';
    $table.find('.pre, .str').each((_, element) => {
      if ($(element).closest('.td, .th, .item').length === 0) {
        $(element).replaceWith($(element).contents());
      }
    });
    $table.find('.CAPTION').each((_, element) => {
      element.tagName = 'caption';
    });
    for (const row of rows) {
      const $row = $(row);
      const header = $row.hasClass('headrow');
      $row.find('.mitem').each((_, group) => {
        if (!header) {
          $(group).replaceWith($(group).contents());
          return;
        }
        group.tagName = 'th';
        group.attribs['colspan'] = String($(group).children('.item').length);
        $(group)
          .contents()
          .each((_, child) => {
            if (child.type === 'text') child.data = child.data.replaceAll('[colret]', '');
          });
        $(group)
          .children('.item')
          .each((_, item) => {
            item.tagName = 'span';
            $(item).before('<br/>');
          });
      });
      const cells = $row.children('.td, .th, .item, .mitem');
      const strayText = $row
        .contents()
        .toArray()
        .some((node) => node.type === 'text' && node.data.trim());
      if (strayText) {
        const cell = $('<td></td>').attr('colspan', String(cells.length));
        cells.each((_, element) => {
          element.tagName = 'span';
          $(element).after(' ');
        });
        cell.append($row.contents());
        $row.append(cell);
      } else {
        cells.each((_, element) => {
          element.tagName = header || $(element).hasClass('th') ? 'th' : 'td';
          if ($(element).text().trim() === '&nbsp;') $(element).text('\u00a0');
        });
      }
      row.tagName = 'tr';
      $row.children('br').remove();
    }
    $table.contents().each((_, node) => {
      if (node.type === 'text' && /^[\s–—=-]*$/.test(node.data)) $(node).remove();
    });
    $table.children('br').remove();
  });

  $('.pre').each((_, element) => {
    if ($(element).closest('pre').length === 0) element.tagName = 'pre';
  });
  $('.row, .headrow').each((_, element) => {
    if (element.tagName === 'tr') return;
    element.tagName = $(element).closest('pre').length ? 'span' : 'div';
    if (element.tagName === 'span') $(element).after('\n');
  });
}
