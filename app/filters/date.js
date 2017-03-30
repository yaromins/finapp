import moment from 'moment'

export default function formatDate(date) {
  let formatedDate
  if (moment.isDate(date)) {
    formatedDate = moment(date).format('D.MM.YY')
  } else {
    formatedDate = moment(date, 'D.MM.YY').format('D.MM.YY')
  }

  const today = moment().format('D.MM.YY')
  const yesterday = moment().subtract(1, 'days').format('D.MM.YY')
  const tomorrow = moment().add(1, 'days').format('D.MM.YY')

  switch (formatedDate) {
    case today: return 'Сегодня'
    case yesterday: return 'Вчера'
    case tomorrow: return 'Завтра'
    default: return formatedDate
  }
}
