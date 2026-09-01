import { expect, test, type Page } from '@playwright/test'

const DEMO = { email: 'demo@lakon.id', sandi: 'CobaLakon2026' }

const masukAkunBaru = async (page: Page) => {
  const response = await page.request.post('/api/auth/daftar', {
    data: {
      nama: 'Penguji Alur',
      email: `uji-alur-${Date.now()}-${Math.floor(Math.random() * 1e6)}@lakon.id`,
      sandi: 'sandi-uji-123',
    },
  })
  expect(response.ok()).toBe(true)
}

const skipAllLearning = async (page: Page) => {
  for (let i = 0; i < 24; i++) {
    if (
      await page
        .getByRole('button', { name: 'Mulai ujian percakapan' })
        .isVisible()
        .catch(() => false)
    ) {
      break
    }
    let clicked = false
    for (const name of [
      'Lewati dulu',
      'Lanjut ke praktik',
      'Tanpa kamera',
      'Sudah cukup mirip, lanjut',
    ]) {
      const button = page.getByRole('button', { name })
      if (await button.isVisible().catch(() => false)) {
        await button.click()
        await page.waitForTimeout(250)
        clicked = true
        break
      }
    }
    if (!clicked) await page.waitForTimeout(300)
  }
  await expect(page.getByRole('button', { name: 'Mulai ujian percakapan' })).toBeVisible()
}

const finishExam = async (page: Page) => {
  for (let i = 0; i < 60; i++) {
    if (
      await page
        .getByRole('heading', { name: 'Ringkasan' })
        .isVisible()
        .catch(() => false)
    ) {
      return
    }
    const produce = page.getByRole('button', { name: 'Sudah kuperagakan, lanjut' })
    if (await produce.isVisible().catch(() => false)) {
      await produce.click()
      await page.waitForTimeout(250)
      continue
    }
    const tanpaKamera = page.getByRole('button', { name: 'Tanpa kamera' })
    if (await tanpaKamera.isVisible().catch(() => false)) {
      await tanpaKamera.click()
      await page.waitForTimeout(250)
      continue
    }
    const mirip = page.getByRole('button', { name: 'Sudah cukup mirip, lanjut' })
    if (await mirip.isVisible().catch(() => false)) {
      await mirip.click()
      await page.waitForTimeout(250)
      continue
    }
    const option = page.locator('.grid button.tombol-sekunder').first()
    if (await option.isVisible().catch(() => false)) {
      await option.click()
      await page.waitForTimeout(250)
      continue
    }
    const lanjut = page.getByRole('button', { name: 'Lanjut', exact: true })
    if (await lanjut.isVisible().catch(() => false)) {
      await lanjut.click()
      await page.waitForTimeout(250)
      continue
    }
    await page.waitForTimeout(300)
  }
  await expect(page.getByRole('heading', { name: 'Ringkasan' })).toBeVisible()
}

const enterScenario = async (page: Page, direction: 'deaf' | 'service') => {
  await page.goto(`/skenario/kedai-kopi?arah=${direction}`)
  await page.getByRole('button', { name: 'Mulai belajar' }).click()
  await expect(page.getByRole('heading', { name: 'halo' })).toBeVisible({ timeout: 60_000 })
}

test.describe('alur inti', () => {
  test('1. landing sampai blok coba satu isyarat tanpa login', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('BISINDO')
    await page.locator('#coba').scrollIntoViewIfNeeded()
    await expect(page.getByRole('button', { name: 'Nyalakan kamera' })).toBeVisible({
      timeout: 30_000,
    })
    await expect(page.getByRole('button', { name: 'Tanpa kamera' })).toBeVisible()
  })

  test('2. daftar, masuk, keluar', async ({ page }) => {
    const email = `uji-${Date.now()}@lakon.id`
    await page.goto('/daftar')
    await page.getByLabel('Nama panggilan').fill('Penguji E2E')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Kata sandi', { exact: true }).fill('sandi-uji-123')
    await page.getByRole('button', { name: 'Buat akun' }).click()
    await page.waitForURL('**/skenario')
    await expect(page.getByText('Penguji E2E')).toBeVisible()

    await page.getByRole('button', { name: 'Keluar' }).click()
    await expect(page.getByRole('link', { name: 'Masuk' })).toBeVisible()

    await page.goto('/masuk')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Kata sandi', { exact: true }).fill('sandi-salah-99')
    await page.getByRole('button', { name: 'Masuk' }).click()
    await expect(page.getByText('Email atau kata sandi tidak cocok.')).toBeVisible()

    await page.getByLabel('Kata sandi', { exact: true }).fill('sandi-uji-123')
    await page.getByRole('button', { name: 'Masuk' }).click()
    await page.waitForURL('**/skenario')
  })

  test('2b. tanpa login, /skenario dialihkan ke /masuk', async ({ page }) => {
    await page.goto('/skenario')
    await page.waitForURL('**/masuk')
    await page.goto('/skenario/kedai-kopi?arah=deaf')
    await page.waitForURL('**/masuk')
  })

  test('3. masuk dengan akun demo yang berprogres', async ({ page }) => {
    await page.goto('/masuk')
    await page.getByLabel('Email').fill(DEMO.email)
    await page.getByLabel('Kata sandi', { exact: true }).fill(DEMO.sandi)
    await page.getByRole('button', { name: 'Masuk' }).click()
    await page.waitForURL('**/skenario')
    await expect(page.getByText('Akun Demo')).toBeVisible()
    await expect(page.getByText(/Isyarat yang sudah dipelajari: [1-9]/)).toBeVisible()
  })

  test('4+6. arah A: fase belajar lalu ujian sampai ringkasan', async ({ page }) => {
    await masukAkunBaru(page)
    await page.goto('/skenario')
    await page.getByRole('link', { name: /Memesan minuman/ }).click()
    await page.getByRole('button', { name: 'Mulai belajar' }).click()
    await expect(page.getByText(/isyarat 1 dari/)).toBeVisible({ timeout: 60_000 })

    await skipAllLearning(page)
    await page.getByRole('button', { name: 'Mulai ujian percakapan' }).click()
    await expect(page.getByText('Selamat pagi, mau pesan apa?')).toBeVisible()
    await finishExam(page)
    await expect(page.getByRole('heading', { name: 'Perlu diulang', exact: false })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Ulangi skenario' })).toBeVisible()
  })

  test('5. tiga kali belum tepat memunculkan jalan keluar', async ({ page }) => {
    test.slow()
    await page.goto('/#coba')
    await page.locator('#coba').scrollIntoViewIfNeeded()
    await page.getByRole('button', { name: 'Nyalakan kamera' }).click({ timeout: 30_000 })
    const start = page.getByRole('button', { name: 'Mulai peragakan' })
    await expect(start).toBeVisible({ timeout: 90_000 })

    const belumTepat = page.getByText('Belum tepat', { exact: false })
    await start.click()
    await expect(belumTepat).toBeVisible({ timeout: 30_000 })
    await expect(page.getByText('tangan', { exact: false }).first()).toBeVisible()

    for (let attempt = 2; attempt <= 3; attempt++) {
      await page.getByRole('button', { name: 'Coba lagi' }).click()
      await expect(belumTepat).toBeHidden()
      await expect(belumTepat).toBeVisible({ timeout: 30_000 })
    }

    await page.getByRole('button', { name: 'Bandingkan sendiri' }).click()
    await expect(page.getByText('Kamu yang menilai', { exact: false })).toBeVisible()
    await page.getByRole('button', { name: 'Sudah cukup mirip, lanjut' }).click()
    await expect(page.getByText('Berhasil')).toBeVisible()
  })

  test('7. arah B: tugas reseptif sampai ringkasan', async ({ page }) => {
    await masukAkunBaru(page)
    await page.goto('/skenario')
    await page.getByText('Sisi pekerja layanan', { exact: false }).click()
    await page.getByRole('link', { name: /Memesan minuman/ }).click()
    await page.getByRole('button', { name: 'Mulai belajar' }).click()
    await expect(page.getByText(/isyarat 1 dari/)).toBeVisible({ timeout: 60_000 })

    await skipAllLearning(page)
    await page.getByRole('button', { name: 'Mulai ujian percakapan' }).click()
    await expect(page.getByText('Apa makna isyarat ini?')).toBeVisible()
    await finishExam(page)
    await expect(page.getByRole('button', { name: 'Ulangi skenario' })).toBeVisible()
  })

  test('8. izin kamera ditolak: jalur alternatif berfungsi', async ({ page }) => {
    await page.addInitScript(() => {
      const denied = () => Promise.reject(new DOMException('Permission denied', 'NotAllowedError'))
      Object.defineProperty(navigator.mediaDevices, 'getUserMedia', { value: denied })
    })
    await page.goto('/#coba')
    await page.locator('#coba').scrollIntoViewIfNeeded()
    await page.getByRole('button', { name: 'Nyalakan kamera' }).click({ timeout: 30_000 })
    await expect(page.getByText('Kamera tidak tersedia', { exact: false })).toBeVisible({
      timeout: 20_000,
    })
    await page.getByRole('button', { name: 'Latihan tanpa kamera' }).click()
    await page.getByRole('button', { name: 'Sudah cukup mirip, lanjut' }).click()
    await expect(page.getByText('Berhasil')).toBeVisible()
  })

  test('9. offline: seluruh skenario masih bisa dijalankan', async ({ page, context }) => {
    test.slow()
    await masukAkunBaru(page)
    await page.goto('/')
    await page.waitForFunction(
      async () => Boolean((await navigator.serviceWorker.getRegistration())?.active),
      undefined,
      { timeout: 30_000 },
    )

    await enterScenario(page, 'deaf')
    await page.waitForTimeout(2000)

    await context.setOffline(true)
    await enterScenario(page, 'deaf')
    await skipAllLearning(page)
    await page.getByRole('button', { name: 'Mulai ujian percakapan' }).click()
    await finishExam(page)
    await expect(page.getByRole('button', { name: 'Ulangi skenario' })).toBeVisible()
    await context.setOffline(false)
  })

  test('10. progres bertahan setelah muat ulang', async ({ page }) => {
    await masukAkunBaru(page)
    await enterScenario(page, 'deaf')
    await page.getByRole('button', { name: 'Lanjut ke praktik' }).click()
    await page.getByRole('button', { name: 'Tanpa kamera' }).click()
    await page.getByRole('button', { name: 'Sudah cukup mirip, lanjut' }).click()
    await page.waitForTimeout(500)

    await page.goto('/skenario')
    await expect(page.getByText(/Isyarat yang sudah dipelajari: [1-9]/)).toBeVisible()
    await page.reload()
    await expect(page.getByText(/Isyarat yang sudah dipelajari: [1-9]/)).toBeVisible()
  })
})
