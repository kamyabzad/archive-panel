<template>
  <CToaster placement="top-end">
    <CToast v-for="toast in toasts" v-bind:key="toast.index">
      <CToastHeader closeButton>
        <span class="me-auto fw-bold">{{ toast.title }}</span>
        <small>7 min ago</small>
      </CToastHeader>
      <CToastBody>{{ toast.content }}</CToastBody>
    </CToast>
  </CToaster>

  <CRow>
    <CCol xs>
      <CFormInput
        v-model="filters.first_name"
        placeholder="نام"
        aria-label="First name"
      />
    </CCol>
    <CCol xs>
      <CFormInput
        v-model="filters.last_name"
        placeholder="نام خانوادگی"
        aria-label="Last name"
      />
    </CCol>
    <CCol xs>
      <CFormInput
        v-model="filters.national_id"
        placeholder="کد ملی"
        aria-label="Last name"
      />
    </CCol>
    <CCol xs>
      <CFormInput
        v-model="filters.recruit_date"
        placeholder="تاریخ اعزام"
        aria-label="Last name"
      />
    </CCol>

    <CCol xs>
      <CButton color="primary" @click="fetchData()">جستجو</CButton>
    </CCol>
  </CRow>

  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader>
          <strong>پرونده‌ها</strong>
        </CCardHeader>
        <CCardBody>
          <CTable striped hover>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell scope="col">شماره پرونده</CTableHeaderCell>
                <CTableHeaderCell scope="col">نام</CTableHeaderCell>
                <CTableHeaderCell scope="col">نام خانوادگی</CTableHeaderCell>
                <CTableHeaderCell scope="col">کد ملی</CTableHeaderCell>
                <CTableHeaderCell scope="col">علت</CTableHeaderCell>
                <CTableHeaderCell scope="col">تحویل‌دهنده</CTableHeaderCell>
                <CTableHeaderCell scope="col">تحویل‌گیرنده</CTableHeaderCell>
                <CTableHeaderCell scope="col">تاریخ خروج</CTableHeaderCell>
                <CTableHeaderCell scope="col">اعمال</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow
                v-for="order in orders"
                v-bind:key="order.id"
                class="row-item"
              >
                <CTableHeaderCell>{{ order.file.file_no }}</CTableHeaderCell>
                <CTableDataCell>{{ order.file.first_name }}</CTableDataCell>
                <CTableDataCell>{{ order.file.last_name }}</CTableDataCell>
                <CTableDataCell>{{ order.file.national_id }}</CTableDataCell>
                <CTableDataCell>{{ order.reason }}</CTableDataCell>
                <CTableDataCell>{{ order.given_by }}</CTableDataCell>
                <CTableDataCell>{{ order.received_by }}</CTableDataCell>
                <CTableDataCell>{{ order.date_received }}</CTableDataCell>
                <CTableDataCell>
                  <CButton color="primary" @click="returned(order.id)"
                    >ثبت بازگشت</CButton
                  >
                </CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>

          <CPagination aria-label="Page navigation example">
            <CPaginationItem
              aria-label="Previous"
              @click="previousPage()"
              :active="hasPreviousPage"
              :disabled="!hasPreviousPage"
            >
              <span aria-hidden="true">&laquo;</span>
            </CPaginationItem>
            <CPaginationItem
              >{{ this.page }}/{{ this.num_pages }}</CPaginationItem
            >
            <CPaginationItem
              aria-label="Next"
              @click="nextPage()"
              :active="hasNextPage"
              :disabled="!hasNextPage"
            >
              <span aria-hidden="true">&raquo;</span>
            </CPaginationItem>
          </CPagination>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<script>
import axios from 'axios'
import FilterQuery from '../utils/filter-query'

export default {
  name: 'Files',

  data() {
    return {
      toasts: [],
      orders: {},
      filters: {},
      page: 1,
      num_pages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    }
  },

  watch: {
    $route: 'fetchData',
  },

  mounted() {
    this.fetchData()
  },

  methods: {
    async fetchData() {
      let response = await axios.get(
        `http://localhost:8000/archive/orders/?${FilterQuery(
          this.filters,
        )}&page=${this.page}&only_away=True`,
      )

      this.num_pages = response.data.num_pages
      this.hasNextPage = this.page < this.num_pages
      this.hasPreviousPage = this.page > 1
      this.orders = response.data.results
    },

    nextPage() {
      if (this.hasNextPage) {
        this.page = this.page + 1
        this.fetchData()
      }
    },

    previousPage() {
      if (this.hasPreviousPage) {
        this.page = this.page - 1
        this.fetchData()
      }
    },

    async returned(id) {
      await axios
        .post(`http://localhost:8000/archive/orders/${id}/returned/`)
        .catch(() => {
          this.createToast('', 'ثبت بازگشت با مشکل مواجه شد')
        })
        .then(() => {
          this.createToast('', 'بازگشت با موفقیت ثبت شد')
          this.fetchData()
        })
    },

    createToast(title, content) {
      this.toasts.push({
        title: '',
        content: content,
      })
    },
  },
}
</script>
