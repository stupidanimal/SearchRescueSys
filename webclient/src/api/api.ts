import axios from 'axios'

// 后端的请求地址及端口
export const host = 'http://127.0.0.1:8000'
axios.defaults.withCredentials = true
axios.defaults.headers = {}
/**
 * 根据code以及date 读取指定时刻的散点
 *
 * @param {string} code
 * @returns
 */
const loadTrackList = (code: string, targetDate: Date) => {
  let trackAvglistUrl = `${host}/rescue/track/`
  return axios.get(trackAvglistUrl, {
    params: {
      code: code,
      date: targetDate
    }
  })
}

const loadTrackAvgList = (code: string) => {
  let trackAvglistUrl = `${host}/rescue/track/avg/`
  return axios.get(trackAvglistUrl, {
    params: {
      code: code
    }
  })
}

export { loadTrackList, loadTrackAvgList }
