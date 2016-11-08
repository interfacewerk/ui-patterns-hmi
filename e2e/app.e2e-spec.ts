import { UiPatternsContactsPage } from './app.po';

describe('ui-patterns-contacts App', function() {
  let page: UiPatternsContactsPage;

  beforeEach(() => {
    page = new UiPatternsContactsPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
