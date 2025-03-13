import { mount, type VueWrapper } from "@vue/test-utils"
import Qrcode from "qrcode.vue"
import { getRouter, type RouterMock } from 'vue-router-mock'
import MockComponent from '@/test/support/MockComponent.vue'
import AdminLobby from './AdminLobby.vue'


let wrapper: VueWrapper
let router: RouterMock

beforeEach(() => {
  router = getRouter()
  router.addRoute({ path: '/lobby/:lobbyId', name: 'user-lobby', component: MockComponent })
  router.setParams({ lobbyId: 1 })
  wrapper = mount(AdminLobby)
})

describe("AdminLobby", () => {
  test("success: lobby render id", () => {
    expect(wrapper.get("[data-testid='lobby-id']").text()).toBe('Lobby ID: 1')
  })

  test("success: qr component is initialized with correct params", () => {
    const expectedPath = router.resolve({ name: 'user-lobby', params: { lobbyId: 1 } }).fullPath

    const path = wrapper.getComponent(Qrcode).props().value

    expect(path).toBe(expectedPath)
  })
})
