import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Table, Row, Col, Modal, Input, Button, Checkbox, Popover, Space, Spin } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';

import './ListUser.scss';

import { searchUsersWithKeywordAndTypesWithPagination } from '../../services/findApiService';
import { adminRoute } from '../../routes/routes';
import { CloseIcon, EditIcon, SortIcon, FilterIcon } from '../../assets/CustomIcon';
import { checkValid, disableUser } from '../../services/disableApiService';
import { getUserDetails } from '../../services/getApiService';
import CustomPagination from '../Pagination/Pagination';

const ListUser = () => {
  const user = useSelector((state) => state.user.user);
  const location = useLocation();
  const navigate = useNavigate();
  const { Search } = Input;
  const [userList, setUserList] = useState([]);
  const [current, setCurrent] = useState(1);
  const [type, setType] = useState(['ADMIN', 'STAFF']);
  const [userDetail, setUserDetail] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Handle Filter
  const CheckboxGroup = Checkbox.Group;
  const plainOptions = ['Admin', 'Staff'];
  const defaultCheckedList = ['ALL'];
  const [checkedList, setCheckedList] = useState([]);
  const [checkAll, setCheckAll] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [confirmPopUp, setConfirmPopUp] = useState(false);
  const [validPopUp, setValidPopUp] = useState(false);
  const [disablePopUp, setDisablePopUp] = useState(false);
  const [valueStaffCode, setValueStaffCode] = useState();
  const [isDisabled, setIsDisable] = useState(false);

  const formatDate = (joineddate) => {
    const initial = joineddate.split(/\//);
    const newdate = new Date([initial[1], initial[0], initial[2]].join('/'));
    return newdate.getTime();
  };

  // Letter case
  const toUpper = function (str) {
    return str.toUpperCase();
  };
  const toTitle = function (txt) {
    return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
  };

  const convertStrDate = (dateStr) => {
    const date = new Date(dateStr);
    return (
      (date.getDate() > 9 ? date.getDate() : '0' + date.getDate()) +
      '/' +
      (date.getMonth() > 8 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1)) +
      '/' +
      date.getFullYear()
    );
  };

  const onChange = async (list) => {
    setCurrent(1);
    setType(list.map(toUpper));
    setCheckedList(list);
    setCheckAll(list.length === plainOptions.length);
    if (list.length === plainOptions.length) {
      setType(['ADMIN', 'STAFF']);
      setCheckAll(true);
      setCheckedList(defaultCheckedList);
    }
  };

  const onCheckAllChange = async (e) => {
    setCurrent(1);
    setCheckedList([]);
    setType(['ADMIN', 'STAFF']);
    setCheckAll(e.target.checked);
  };

  const content = (
    <div style={{ display: 'table-caption' }}>
      <Checkbox
        defaultChecked={defaultCheckedList}
        onChange={onCheckAllChange}
        checked={checkAll}
        className="checkbox-filter"
      >
        All
      </Checkbox>
      <CheckboxGroup options={plainOptions} value={checkedList} onChange={onChange} className="checkbox-filter" />
    </div>
  );

  const limit = 20;
  const sortField = 'firstName';
  const sortType = 'ASC';

  useEffect(() => {
    setIsLoading(true);
    getData(searchValue, type, limit, current - 1, sortField, sortType);
  }, [current, isDisabled, searchValue, type]);

  const getData = async (keyWord, types, limit, page, sortField, sortType) => {
    const response = await searchUsersWithKeywordAndTypesWithPagination({
      keyWord,
      types,
      limit,
      page,
      sortField,
      sortType,
    });
    if (response.status === 200) {
      const userResponse = location.state?.userResponse;
      if (userResponse && userResponse.location && userResponse.location === user.location && isDisabled === false) {
        const listDatas = response?.data.data.filter((item) => item.username !== userResponse.username);
        listDatas.unshift(userResponse);
        setUserList({
          ...response.data,
          data: listDatas,
        });
      } else {
        setUserList(response.data);
      }
      setIsLoading(false);
      window.history.replaceState({}, document.title);
    }
  };

  const ApiUserDetails = async (staffCode) => {
    const response = await getUserDetails(staffCode);
    if (response.status === 200) {
      setUserDetail(response.data);
    }
  };

  const onClickToEdit = (data) => {
    navigate(`/${adminRoute.home}/${adminRoute.manageUser}/${adminRoute.editUser}/${data.currentTarget.dataset.id}`);
  };

  const title = (title) => {
    return (
      <div id="frame">
        <div>{title}</div>
        <div>
          <SortIcon />
        </div>
      </div>
    );
  };

  const columns = [
    {
      width: '8em',
      title: title('Staff Code'),
      dataIndex: 'staffCode',
      key: 'staffcode',
      ellipsis: true,
      sortDirections: ['ascend', 'desencd', 'ascend'],
      sorter: (a, b) => a.staffCode.match(/\d+/)[0] - b.staffCode.match(/\d+/)[0],
    },
    {
      width: '9em',
      title: title('Full Name'),
      dataIndex: 'fullName',
      ellipsis: true,
      key: 'fullname',
      defaultSortOder: 'ascend',
      sortDirections: ['ascend', 'desencd', 'ascend'],
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
      render: (text, record) => (
        <a className="user-list" data-id={record.staffCode} onClick={showModal}>
          {text}
        </a>
      ),
    },
    {
      width: '9em',
      title: 'Username',
      dataIndex: 'username',
      ellipsis: true,
      key: 'username',
    },
    {
      width: '10em',
      title: title('Joined Date'),
      dataIndex: 'joinedDate',
      key: 'joineddate',
      ellipsis: true,
      sortDirections: ['ascend', 'desencd', 'ascend'],
      sorter: (a, b) => formatDate(convertStrDate(a.joinedDate)) - formatDate(convertStrDate(b.joinedDate)),
      render: (text) => convertStrDate(text),
    },
    {
      width: '5em',
      title: title('Type'),
      dataIndex: 'type',
      key: 'type',
      ellipsis: true,
      sortDirections: ['ascend', 'desencd', 'ascend'],
      sorter: (a, b) => a.type.localeCompare(b.type),
      render: (text) => toTitle(text),
      responsive: ['xxl'],
    },
    {
      width: '4em',
      align: 'center',
      key: 'options',
      dataIndex: 'status',
      title: '',
      render: (_text, record) => (
        <div id="frame">
          <div className="edit-icon">
            <Button data-id={record.staffCode} type="link" icon={<EditIcon />} onClick={onClickToEdit}></Button>
          </div>
          <div></div>
          <div>
            <Button
              onClick={record.username === user?.username ? onClickToCurrentUser : onClickToCheck}
              data-id={record.staffCode}
              type="link"
              icon={<CloseCircleOutlined style={{ color: 'red' }} />}
            ></Button>
          </div>
        </div>
      ),
    },
  ].filter((item) => !item.hidden);

  const onClickToCheck = async (staffCode) => {
    setIsDisable(false);
    setValueStaffCode(staffCode.currentTarget.dataset.id);
    const response = await checkValid(staffCode.currentTarget.dataset.id);
    if (response.status === 200) {
      setConfirmPopUp(true);
    } else {
      setValidPopUp(true);
    }
  };

  const onClickToCurrentUser = async () => {
    setDisablePopUp(true);
  };

  const onClickToDisable = async () => {
    const response = await disableUser(valueStaffCode);
    if (response.status === 204) {
      setConfirmPopUp(false);
      setIsDisable(true);
    }
  };

  const showModal = (staffcode) => {
    ApiUserDetails(staffcode.currentTarget.dataset.id);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const onSearch = async (value) => {
    setCurrent(1);
    setSearchValue(value);
  };

  return (
    <div className="list-user-wrapper">
      <div>
        <Row>
          <Col xs={20} sm={4} md={6} lg={10} xl={11}>
            <Popover
              id="filter-user-type"
              content={content}
              placement="bottom"
              trigger="click"
              overlayClassName="list-user-dropdown-box-type"
            >
              <Button className="handle-filter">
                <Row>
                  <Col span={21}>Type</Col>
                  <Col span={1} className="border-right"></Col>
                  <Col span={2}>
                    <FilterIcon type="filter" />
                  </Col>
                </Row>
              </Button>
            </Popover>
          </Col>
          <Col xs={20} sm={16} md={12} lg={10} xl={8}>
            <Search maxLength={100} className="handle-search" allowClear onSearch={onSearch} id="search-user"></Search>
          </Col>
          <Col xs={2} sm={4} md={6} lg={4} xl={5}>
            <Row justify={'end'}>
              <Button
                className="handle-button"
                onClick={() => navigate(`/${adminRoute.home}/${adminRoute.manageUser}/${adminRoute.createUser}`)}
              >
                Create new user
              </Button>
            </Row>
          </Col>
        </Row>
      </div>
      <br></br>
      {isLoading ? (
        <Space size="middle">
          <Spin size="large" style={{ paddingLeft: '30rem', paddingTop: '10rem' }} />
        </Space>
      ) : (
        <>
          <Table
            showSorterTooltip={false}
            size="small"
            sortDirections={'ascend'}
            pagination={false}
            className="user-list"
            dataSource={userList.data}
            columns={columns}
          />

          <div className="user-list">
            <CustomPagination total={userList['totalRow']} current={current} onChange={setCurrent} />
          </div>
        </>
      )}
      <Modal
        centered
        className="assignment-details__modal"
        mask={false}
        title={'Detailed User Information'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        closeIcon={<CloseIcon />}
      >
        <Row>
          <Col span={8} sm={5} md={6}>
            <div className="title">Staff Code</div>
          </Col>

          <Col span={16} sm={19} md={18}>
            <div className="content">{userDetail?.staffCode ?? ''}</div>
          </Col>
        </Row>
        <Row>
          <Col span={8} sm={5} md={6}>
            <div className="title">Full Name</div>
          </Col>
          <Col span={16} sm={19} md={18}>
            <div className="content">{userDetail?.fullName ?? ''}</div>
          </Col>
        </Row>
        <Row>
          <Col span={8} sm={5} md={6}>
            <div className="title">Username</div>
          </Col>
          <Col span={16} sm={19} md={18}>
            <div className="content">{userDetail?.username ?? ''}</div>
          </Col>
        </Row>
        <Row>
          <Col span={8} sm={5} md={6}>
            <div className="title">Date of Birth</div>
          </Col>
          <Col span={16} sm={19} md={18}>
            <div className="content">{userDetail?.dateOfBirth ? convertStrDate(userDetail?.dateOfBirth) : ''}</div>
          </Col>
        </Row>
        <Row>
          <Col span={8} sm={5} md={6}>
            <div className="title">Gender</div>
          </Col>
          <Col span={16} sm={19} md={18}>
            <div className="content">{userDetail?.gender ? toTitle(userDetail?.gender) : ''}</div>
          </Col>
        </Row>
        <Row>
          <Col span={8} sm={5} md={6}>
            <div className="title">Joined Date</div>
          </Col>
          <Col span={16} sm={19} md={18}>
            <div className="content">{userDetail?.joinedDate ? convertStrDate(userDetail?.joinedDate) : ''}</div>
          </Col>
        </Row>
        <Row>
          <Col span={8} sm={5} md={6}>
            <div className="title">Type</div>
          </Col>
          <Col span={16} sm={19} md={18}>
            <div className="content">{userDetail?.type ? toTitle(userDetail?.type) : ''}</div>
          </Col>
        </Row>
        <Row>
          <Col span={8} sm={5} md={6}>
            <div className="Location">Note</div>
          </Col>
          <Col span={16} sm={19} md={18}>
            <div className="content">{userDetail?.location ?? ''}</div>
          </Col>
        </Row>
      </Modal>

      <Modal
        className="user-list__valid-modal"
        title={'Can not disable user'}
        centered
        open={validPopUp}
        onCancel={() => setValidPopUp(false)}
        onOk={() => setValidPopUp(false)}
        footer={null}
        closeIcon={<CloseIcon />}
        mask={null}
      >
        <p>There are valid assignments belonging to this user.</p>
        <p>Please close all assignments before disabling user.</p>
      </Modal>

      <Modal
        open={confirmPopUp}
        className="user-list__disable-modal"
        title={'Are you sure?'}
        centered
        onOk={onClickToDisable}
        onCancel={() => setConfirmPopUp(false)}
        okText="Disable"
        cancelText="Cancel"
        closable={false}
      >
        <p>Do you want to disable this user?</p>
      </Modal>

      <Modal
        className="user-list__disable-modal"
        title={'Can not disable user'}
        centered
        open={disablePopUp}
        onCancel={() => setDisablePopUp(false)}
        onOk={() => setDisablePopUp(false)}
        footer={null}
        closeIcon={<CloseIcon />}
        mask={null}
      >
        <p>You can not disable your account</p>
      </Modal>
    </div>
  );
};

export default ListUser;
