import {
  InputGroup,
  FormControl,
  Button,
  Row,
  Col,
  Card,
} from 'react-bootstrap'
import { useState, useEffect } from 'react'
import axios from 'axios'
import ModalScan from '../components/AppNavbar/ModalScan'
import { Link } from 'react-router-dom'

export default function ProduitPage() {
  const [inputEan, setInputEan] = useState('')
  const [produits, setProduits] = useState([])

  const [displayModal, setDisplayModal] = useState(false)
  const closeModal = () => setDisplayModal(false)
  const showModal = () => setDisplayModal(true)

  useEffect(() => {
    getProduits()
  }, [])

  async function getProduits() {
    const datas = await axios.get('http://localhost:3100/produits')
    console.log(datas)
    setProduits(datas.data)
  }

  async function deleteProduit(produit) {
    let rep = window.confirm(
      `Etes-vous sûr de vouloir supprimer le produit : ${produit.nom} ? `
    )
    if (rep === true) {
      const res = await axios.delete(
        `http://localhost:3100/produits/${produit._id}`
      )
      console.log(res)
      getProduits()
    }
  }

  function add(ean) {
    const useEan = ean !== undefined ? ean : inputEan
    axios
      .get(`https://world.openfoodfacts.org/api/v0/product/${useEan}.json`)
      .then(async (datas) => {
        if (datas.data.status === 1) {
          alert(`Produit trouvé : ${datas.data.product.product_name_fr}`)
          let produit = {
            ean: useEan,
            marque: datas.data.product.brands,
            nom: datas.data.product.product_name_fr,
            img: datas.data.product.image_url,
            imgSmall: datas.data.product.image_thumb_url,
            nutriscore: datas.data.product.nutriscore_grade,
          }
          await axios.post('http://localhost:3100/produits', produit)

          getProduits()
          setInputEan('')
        } else alert(`Produit non trouvé : ${useEan}`)
      })
  }

  let displayProduits = produits.map((produit, indice) => {
    return (
      <Col md="4" key={'produit-' + indice}>
        <Card>
          <Card.Img variant="top" className="img-card" src={produit.img} />
          <Card.Body>
            <Card.Title>{produit.nom}</Card.Title>
            <Card.Text>{produit.marque}</Card.Text>
            <Button variant="warning" as={Link} to={`/produits/${produit._id}`}>
              Modifier
            </Button>{' '}
            <Button
              variant="outline-danger"
              onClick={() => deleteProduit(produit)}
            >
              Supprimer
            </Button>
          </Card.Body>
        </Card>
      </Col>
    )
  })
  return (
    <>
      <h1>Liste des produits</h1>
      <hr />

      <Row>
        <Col md="6">
          <InputGroup className="mb-3">
            <Button variant="info" onClick={showModal}>
              Scanner
            </Button>
            <FormControl
              placeholder="Saisir un EAN"
              value={inputEan}
              onChange={(e) => setInputEan(e.target.value)}
              maxLength="13"
            />
            <Button variant="primary" onClick={add}>
              Ajouter
            </Button>
          </InputGroup>
        </Col>
      </Row>

      <Row>{displayProduits}</Row>

      <ModalScan
        displayModal={displayModal}
        closeModal={closeModal}
        setInputEan={setInputEan}
        addProduit={add}
      />
    </>
  )
}
