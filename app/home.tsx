"use client";
import React, { useState } from 'react';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Alert, Button, Checkbox, Col, Drawer, Form, Input, message, Pagination, Row, Space, Spin, Switch } from 'antd';
import { useMutation, useQuery } from '@tanstack/react-query'
import { NoticeType } from 'antd/es/message/interface';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

const Home = () => {

  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [title, setTitle] = useState('');
  const [searchTitle, setSearchTitle] = useState('');
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  }

  const handlePageSizeChange = (current: number, size: number) => {
    setPageSize(size);
    setCurrentPage(current);
  }

  const handleSearch = () => {
    setSearchTitle(title);
    refetch();
  }

  const handleSave = () => {
    form.validateFields().then((values) => {
      mutate(values);
    });
  }

  const fetchTodos = async (page = 1, limit = 10, title = '') => {
    const response = await fetch(`https://jsonplaceholder.typicode.com/todos?_page=${page}&_limit=${limit}&q=${title}`);
    if (!response.ok) throw new Error('Network response was not ok');
    var data = await response.json();
    var total = response.headers.get('x-total-count');
    return { data, total: Number(total) };
  }

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ['todos', currentPage, pageSize, searchTitle],
    queryFn: () => fetchTodos(currentPage, pageSize, searchTitle),
    select: (response) => ({
      todos: response.data,
      total: response.total
    })
  });

  const createTodo = async (newTodo: { title: string, completed: boolean }) => {
    const response = await fetch('https://jsonplaceholder.typicode.com/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTodo),
    });
    if (!response.ok) throw new Error('Erro ao criar ToDo');
    return response.json();
  }

  const { mutate, isPending } = useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      refetch();
      form.resetFields();
      onClose();
      showMessage('success', 'ToDo criado com sucesso!');
    },
    onError: () => {
      showMessage('error', 'Erro ao criar ToDo!');
    },
  });

  const showMessage = (tipo: NoticeType, mensagem: String) => {
    messageApi.open({ type: tipo, content: mensagem, });
  };

  if (isLoading) return <Spin />;
  if (error) return <Alert message="Error" description={error.message} type="error" />;

  return (
    <div className="App">
      <div className="div-header">
        <div className="div-header-left">
          <Input style={{ width: '85%' }} placeholder="Buscar por descrição" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Button type="primary" onClick={handleSearch}><SearchOutlined />Buscar</Button>
        </div>
        <div>
          <Button type="primary" onClick={showDrawer} icon={<PlusOutlined />}>Novo ToDo</Button>
          <Drawer
            title="Novo ToDo"
            width={600}
            onClose={onClose}
            open={open}
            styles={{
              body: {
                paddingBottom: 80,
              },
            }}
            extra={
              <Space>
                <Button onClick={onClose}>Cancelar</Button>
                {contextHolder}
                <Button onClick={handleSave} type="primary" loading={isPending}>Salvar</Button>
              </Space>
            }
          >
            <Form form={form} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="Title"
                    label="Descrição"
                    rules={[{ required: true, message: 'Informe a descrição' }]}
                  >
                    <Input placeholder="Informe a descrição" />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    name="Completed"
                    label="Completo"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Drawer>
        </div>
      </div>
      <div className="div-body">
        {data?.todos?.map((todo: Todo) => (
          <Row className="div-body-row" justify="center" key={todo.id}>
            <Col className="div-body-col" flex="30px"><Checkbox checked={todo.completed} disabled /></Col>
            <Col className="div-body-col" flex="auto"><strong>{todo.title}</strong></Col>
          </Row>
        ))}
        <Pagination
          className="div-body-pag"
          current={currentPage}
          pageSize={pageSize}
          total={data?.total || 0}
          showSizeChanger
          onChange={handlePageChange}
          onShowSizeChange={handlePageSizeChange}
          showTotal={(total, range) => `${range[0]}-${range[1]} de ${total} itens`}
        />
      </div>
    </div>
  );
}

export default Home;