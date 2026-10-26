"""Browser smoke checks. Start Vite or preview first; set BASE_URL if needed.
To check live statistics with mocked Discord, build with VITE_DISCORD_INVITE
set to https://discord.gg/test-community, then set TEST_STATS=1.
"""
import asyncio
import json
import os
import time
from pathlib import Path
from playwright.async_api import async_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
BASE = os.environ.get('BASE_URL', 'http://localhost:5173')


async def main():
    async with async_playwright() as p:
        executable = '/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else None
        browser = await p.chromium.launch(executable_path=executable, args=['--no-sandbox'])
        context = await browser.new_context(accept_downloads=True, reduced_motion='reduce')
        user = {'id': '223456789012345678', 'name': 'Session User', 'username': 'session.user', 'avatar': 'https://cdn.discordapp.com/embed/avatars/0.png', 'profileUrl': 'https://discord.com/users/223456789012345678'}
        session = {'configured': True, 'user': None, 'expiresAt': None}
        await context.route('**/api/auth/session', lambda route: route.fulfill(status=200, content_type='application/json', body=json.dumps(session)))
        await context.route('https://cdn.discordapp.com/**', lambda route: route.fulfill(path=ROOT / 'public/images/conversation.jpg'))
        team = {'configured': True, 'partial': False, 'members': [dict(user, id=str(323456789012345678+i), name=name, username=name.lower(), handle='@'+name.lower(), role=role, bio='Test fixture') for i, (name, role) in enumerate([('Ara','Founder'),('Ren','Moderator'),('Kai','Event Host'),('Luna','Designer')])]}
        await context.route('**/api/team', lambda route: route.fulfill(status=200, content_type='application/json', body=json.dumps(team)))
        page = await context.new_page()
        await page.route('https://discord.com/api/v10/invites/**', lambda route: route.fulfill(status=503, content_type='application/json', body='{}'))
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        await page.goto(BASE + '/twibbon', wait_until='networkidle')
        await expect(page.get_by_role('heading', level=1)).to_contain_text('Masuk, lalu ikut ceritanya.')
        assert await page.locator('input[type=file]').count() == 0
        assert '/api/auth/login?returnTo=%2Ftwibbon' in await page.locator('.login-card a').get_attribute('href')
        session.update(user=user, expiresAt=int(time.time() * 1000) + 3600000)
        await page.goto(BASE + '/account', wait_until='networkidle')
        await expect(page.locator('.account-card')).to_contain_text('session.user')
        await page.goto(BASE, wait_until='networkidle')
        await expect(page.locator('.member')).to_have_count(4)
        assert await page.locator('.member').filter(has_text='Session User').count() == 0
        await expect(page.get_by_role('heading', level=1)).to_contain_text('Malam panjang.')
        for width in [320, 390, 768, 1024, 1440]:
            await page.set_viewport_size({'width': width, 'height': 900})
            assert await page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'), f'Overflow at {width}px'
        await page.get_by_role('button', name='EN', exact=True).click()
        await expect(page.get_by_role('heading', level=1)).to_contain_text('Long nights.')
        await page.reload()
        await expect(page.locator('html')).to_have_attribute('lang', 'en')
        await page.get_by_role('button', name='ID', exact=True).click()
        search = page.get_by_role('searchbox')
        await search.fill('nobody-matches')
        await expect(page.get_by_text('Belum ada anggota yang cocok.')).to_be_visible()
        await page.get_by_role('button', name='Reset pencarian').click()
        await search.fill('Moderator')
        await expect(page.locator('.member')).to_have_count(1)
        await page.locator('.member').click()
        await expect(page.get_by_role('dialog')).to_be_visible()
        await expect(page.locator('.member-profile-name')).to_contain_text('Ren')
        await expect(page.locator('.member-profile-handle')).to_have_text('@ren')
        await expect(page.locator('.member-profile-details dd')).to_have_text(['Moderator', 'Moderator'])
        await expect(page.get_by_role('link', name='Buka profil Discord')).to_have_attribute('href', user['profileUrl'])
        for width in [320, 390, 1440]:
            await page.set_viewport_size({'width': width, 'height': 844})
            assert await page.locator('dialog').evaluate('(el) => el.scrollWidth <= el.clientWidth'), f'Profile overflow at {width}px'
            await expect(page.get_by_role('button', name='Close / Tutup')).to_be_visible()
        await page.keyboard.press('Escape')
        await expect(page.get_by_role('dialog')).to_have_count(0)
        await expect(page.locator('.member')).to_be_focused()
        team['members'][1].update(banner='/images/conversation.jpg', guildTag='crew', avatarDecoration='https://cdn.discordapp.com/avatar-decoration-presets/' + 'a_' + 'd'*32 + '.png', division='Community')
        await page.reload(wait_until='networkidle')
        await page.locator('.member').filter(has_text='Ren').click()
        await expect(page.locator('.member-profile-banner img')).to_have_attribute('src', '/images/conversation.jpg')
        await expect(page.locator('.member-profile-decoration')).to_be_visible()
        await expect(page.locator('.member-guild-tag')).to_have_text('crew')
        await expect(page.locator('.member-profile-details dd').first).to_have_text('Community')
        await page.get_by_role('button', name='Close / Tutup').click()
        await search.fill('')
        await page.locator('.team-toolbar select').first.select_option('Designer')
        await expect(page.locator('.member')).to_have_count(1)
        await page.locator('.team-toolbar select').first.select_option('')
        await page.locator('.team-toolbar select').nth(1).select_option('true')
        await expect(page.locator('.member').first).to_contain_text('Ara')
        await page.get_by_role('button', name='Music', exact=True).click()
        await expect(page.locator('.event-card')).to_have_count(1)
        await page.locator('.event-card').click()
        await expect(page.get_by_role('dialog')).to_contain_text('After Hours')
        await page.keyboard.press('Escape')
        await page.get_by_role('button', name='Semua', exact=True).click()
        await page.locator('.faq-list summary').first.click()
        await expect(page.locator('.faq-list details').first).to_have_attribute('open', '')
        await page.set_viewport_size({'width': 390, 'height': 844})
        await page.evaluate('window.scrollTo(0,0)')
        await page.get_by_role('button', name='Menu', exact=True).click()
        await expect(page.locator('#main-nav')).to_be_visible()
        await page.locator('#main-nav a').nth(2).click()
        await expect(page.locator('#main-nav')).to_be_hidden()

        await page.goto(BASE + '/forms/public', wait_until='networkidle')
        await page.get_by_label('Nama panggilan', exact=True).fill('Tester')
        await page.get_by_label('Username Discord').fill('tester_name')
        await page.get_by_label('Apa yang ingin kamu bawa ke komunitas?').fill('Saya ingin membantu mengadakan kegiatan komunitas.')
        await page.get_by_label('Kapan biasanya kamu tersedia?').fill('Jumat 20.00 WIB')
        await page.get_by_role('button', name='Simpan draft').click()
        await page.reload()
        await expect(page.get_by_label('Nama panggilan', exact=True)).to_have_value('Tester')
        await page.get_by_role('checkbox').check()
        async with page.expect_download() as download_info:
            await page.get_by_role('button', name='Unduh salinan').click()
        download = await download_info.value
        data = json.loads(Path(await download.path()).read_text())
        assert data['nickname'] == 'Tester' and data['discord'] == 'tester_name'
        await expect(page.get_by_role('status')).to_contain_text('belum dikirim')
        await page.get_by_role('button', name='Hapus draft').click()
        await page.reload()
        await expect(page.get_by_label('Nama panggilan', exact=True)).to_have_value('Session User')

        await page.goto(BASE + '/twibbon', wait_until='networkidle')
        await expect(page.get_by_role('button', name='Unduh PNG')).to_be_disabled()
        await page.locator('input[type=file]').set_input_files(ROOT / 'public/images/conversation.jpg')
        await expect(page.get_by_role('button', name='Unduh PNG')).to_be_enabled()
        await page.get_by_label('Namamu (opsional)').fill('Tester')
        await page.get_by_label('Perbesar', exact=True).fill('1.5')
        await page.get_by_label('Posisi horizontal').fill('20')
        async with page.expect_download() as download_info:
            await page.get_by_role('button', name='Unduh PNG').click()
        download = await download_info.value
        png = Path(await download.path()).read_bytes()
        assert png[:8] == b'\x89PNG\r\n\x1a\n' and int.from_bytes(png[16:20], 'big') == 1080
        await page.get_by_role('button', name='Reset', exact=True).click()
        await expect(page.get_by_label('Perbesar', exact=True)).to_have_value('1')

        await page.goto(BASE + '/webhooks/editor', wait_until='networkidle')
        await page.get_by_label('Judul').fill('<script>alert(1)</script>')
        await expect(page.locator('.discord-embed h3')).to_have_text('<script>alert(1)</script>')
        assert await page.locator('.discord-embed script').count() == 0
        await page.get_by_label('Isi pesan').fill('Hello @everyone')
        async with page.expect_download() as download_info:
            await page.get_by_role('button', name='Unduh JSON').click()
        data = json.loads(Path(await (await download_info.value).path()).read_text())
        assert data['allowed_mentions']['parse'] == [] and data['embeds'][0]['description'] == 'Hello @everyone'
        await page.get_by_label('Judul').fill('')
        await page.get_by_label('Isi pesan').fill('')
        await expect(page.get_by_role('button', name='Unduh JSON')).to_be_disabled()

        if os.environ.get('TEST_STATS') == '1':
            counter = 0
            async def discord_response(route):
                nonlocal counter
                counter += 1
                if counter == 1:
                    await route.fulfill(status=503, content_type='application/json', body='{}')
                else:
                    await route.fulfill(status=200, content_type='application/json', body=json.dumps({'approximate_member_count': 1234, 'approximate_presence_count': 321}))
            await page.route('https://discord.com/api/v10/invites/**', discord_response)
            await page.goto(BASE, wait_until='networkidle')
            await expect(page.get_by_text('Statistik belum bisa dimuat.')).to_be_visible()
            await page.get_by_role('button', name='Coba lagi').click()
            await expect(page.locator('.stat strong').first).to_have_text('1.234')
            await expect(page.locator('.stat strong').nth(1)).to_have_text('321')
            await page.unroute('https://discord.com/api/v10/invites/**')

        await page.goto(BASE + '/missing', wait_until='networkidle')
        await expect(page.get_by_role('heading', level=1)).to_contain_text('Halaman belum ditemukan')
        # Check that storage failures never prevent browsing.
        blocked = await browser.new_context()
        await blocked.route('**/api/auth/session', lambda route: route.fulfill(status=200, content_type='application/json', body=json.dumps(session)))
        await blocked.route('https://cdn.discordapp.com/**', lambda route: route.fulfill(path=ROOT / 'public/images/conversation.jpg'))
        await blocked.add_init_script("Storage.prototype.getItem = () => { throw new Error('blocked') }; Storage.prototype.setItem = () => { throw new Error('blocked') };")
        blocked_page = await blocked.new_page()
        await blocked_page.goto(BASE + '/forms/public', wait_until='networkidle')
        await expect(blocked_page.get_by_role('heading', level=1)).to_contain_text('Form Komunitas')
        await blocked_page.get_by_role('button', name='Simpan draft').click()
        await expect(blocked_page.get_by_role('status')).to_contain_text('tidak mengizinkan')
        await blocked.close()
        await page.goto(BASE + '/account', wait_until='networkidle')
        async def logout_response(route):
            session.update(user=None, expiresAt=None)
            await route.fulfill(status=200, content_type='application/json', body='{"user":null}')
        await page.route('**/api/auth/logout', logout_response)
        await page.get_by_role('button', name='Keluar dari website').click()
        await expect(page.get_by_role('heading', level=1)).to_contain_text('Masuk, lalu ikut ceritanya.')
        await page.goto(BASE + '/webhooks/editor', wait_until='networkidle')
        await expect(page.get_by_role('heading', level=1)).to_contain_text('Masuk, lalu ikut ceritanya.')
        await page.goto(BASE + '/login?error=discord_configuration', wait_until='networkidle')
        await expect(page.get_by_role('alert')).to_contain_text('Discord menolak konfigurasi')
        await page.goto(BASE + '/login?error=login_expired', wait_until='networkidle')
        await expect(page.get_by_role('alert')).to_contain_text('Kode login sudah kedaluwarsa')
        assert not errors, errors
        print('PASS: layouts, languages, team filters, modal keyboard, events, mobile navigation, form persistence/export, Twibbon crop/PNG, webhook export, storage failures, direct routes' + (', statistics retry/success' if os.environ.get('TEST_STATS') else ''))
        await browser.close()


asyncio.run(main())
