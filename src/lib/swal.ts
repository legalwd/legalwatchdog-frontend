import Swal from 'sweetalert2'

const themedSwal = Swal.mixin({
  customClass: {
    confirmButton: 'btn--default btn--lg',
    cancelButton: 'btn--secondary btn--lg',
    actions: 'gap-4',
  },
  buttonsStyling: false,
  reverseButtons: true,
})

export default themedSwal
