const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

// import Enzyme from 'enzyme';
// import Adapter from 'enzyme-adapter-react-16';

// Enzyme.configure({ adapter: new Adapter() });

const should = chai.should();
chai.use(chaiHttp);

describe('API', () => {

    before(function() {
        return runServer();
      });
    
    after(function() {
        return closeServer();
    });

    it('should 200 on GET requests', () => {
        return chai
            .request(app)
            .get('/iob-stack/')
            .then((res) => {
                res.should.have.status(200);
                res.should.be.json;
        });
    });
});
