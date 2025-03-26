import type { PlayerWithPoints } from '@/lib/supahoot/quizzes/player'
import { container } from '@/test/support/setup-container-mock'
import { HTMLUtils } from '@/test/support/utils/html-utils'
import { flushPromises, mount } from '@vue/test-utils'
import { getRouter, type RouterMock } from 'vue-router-mock'
import AdminAwardsView from './AdminAwardsView.vue'

let router: RouterMock

const pageParams = { quizId: 3, lobbyId: 1 }

beforeEach(() => {
  router = getRouter()
  router.setParams(pageParams)
})

const awardsDashboard: PlayerWithPoints[] = [
  { id: 1, username: 'User1', image: 'image1', points: 10 },
  { id: 2, username: 'User2', image: 'image2', points: 20 },
]

const copy = JSON.parse(JSON.stringify(awardsDashboard)) as PlayerWithPoints[]
const sortedAwardsDashboard = copy.sort((a, b) => b.points - a.points)

describe('AdminAwardsView', () => {
  test('success: call the service to get dashboard with lobby id', () => {
    mount(AdminAwardsView)

    expect(container.quizService.getAwardsDashboard).toHaveBeenCalledWith(pageParams.lobbyId)
  })

  test('success: show places awards dashboard', async () => {
    container.quizService.getAwardsDashboard.mockResolvedValue(awardsDashboard)
    const wrapper = mount(AdminAwardsView)
    await flushPromises()

    const $places = wrapper.findAll(HTMLUtils.testId('place'))

    expect($places.length).toBe(awardsDashboard.length)
  })

  test('success: show places the awards dashboard', async () => {
    container.quizService.getAwardsDashboard.mockResolvedValue(awardsDashboard)
    const wrapper = mount(AdminAwardsView)
    await flushPromises()

    const $places = wrapper.findAll(HTMLUtils.testId('place'))

    $places.forEach(($place, index) => {
      const award = sortedAwardsDashboard[index]
      expect($place.text()).toContain(award.username)
      expect($place.text()).toContain(award.points)
      expect($place.find(HTMLUtils.testId('avatar')).attributes('src')).toBe(award.image)
    })
  })
})
