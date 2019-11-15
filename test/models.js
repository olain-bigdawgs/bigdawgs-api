const { expect } = require('chai');
const sinon = require('sinon');
require('sinon-mongoose');

const User = require('../models/User');
const GreetingCard = require('../models/GreetingCard');
const Image = require('../models/Image');
const Video = require('../models/Video');
const Sound = require('../models/Sound');

describe('User Model', () => {
  it('should create a new user', (done) => {
    const UserMock = sinon.mock(new User({ email: 'test@gmail.com', password: 'root' }));
    const user = UserMock.object;

    UserMock
      .expects('save')
      .yields(null);

    user.save((err) => {
      UserMock.verify();
      UserMock.restore();
      expect(err).to.be.null;
      done();
    });
  });

  it('should return error if user is not created', (done) => {
    const UserMock = sinon.mock(new User({ email: 'test@gmail.com', password: 'root' }));
    const user = UserMock.object;
    const expectedError = {
      name: 'ValidationError'
    };

    UserMock
      .expects('save')
      .yields(expectedError);

    user.save((err, result) => {
      UserMock.verify();
      UserMock.restore();
      expect(err.name).to.equal('ValidationError');
      expect(result).to.be.undefined;
      done();
    });
  });

  it('should not create a user with the unique email', (done) => {
    const UserMock = sinon.mock(User({ email: 'test@gmail.com', password: 'root' }));
    const user = UserMock.object;
    const expectedError = {
      name: 'MongoError',
      code: 11000
    };

    UserMock
      .expects('save')
      .yields(expectedError);

    user.save((err, result) => {
      UserMock.verify();
      UserMock.restore();
      expect(err.name).to.equal('MongoError');
      expect(err.code).to.equal(11000);
      expect(result).to.be.undefined;
      done();
    });
  });

  it('should find user by email', (done) => {
    const userMock = sinon.mock(User);
    const expectedUser = {
      _id: '5700a128bd97c1341d8fb365',
      email: 'test@gmail.com'
    };

    userMock
      .expects('findOne')
      .withArgs({ email: 'test@gmail.com' })
      .yields(null, expectedUser);

    User.findOne({ email: 'test@gmail.com' }, (err, result) => {
      userMock.verify();
      userMock.restore();
      expect(result.email).to.equal('test@gmail.com');
      done();
    });
  });

  it('should remove user by email', (done) => {
    const userMock = sinon.mock(User);
    const expectedResult = {
      nRemoved: 1
    };

    userMock
      .expects('remove')
      .withArgs({ email: 'test@gmail.com' })
      .yields(null, expectedResult);

    User.remove({ email: 'test@gmail.com' }, (err, result) => {
      userMock.verify();
      userMock.restore();
      expect(err).to.be.null;
      expect(result.nRemoved).to.equal(1);
      done();
    });
  });

  it('should check password', (done) => {
    const UserMock = sinon.mock(new User({
      email: 'test@gmail.com',
      password: '$2b$10$LhjJj5s1pLY/I4eCRaHaB.Fli8NBT8z1L8YF4/pmVU.5pERg4Z1AC'
    }));

    const user = UserMock.object;

    user.comparePassword('root', (err, isMatched) => {
      expect(err).to.equal(undefined);
      expect(isMatched).to.equal(true);
      done();
    });
  });

  it('should generate gravatar without email and size', () => {
    const UserMock = sinon.mock(new User({}));
    const user = UserMock.object;

    const gravatar = user.gravatar();
    expect(gravatar.includes('gravatar.com')).to.equal(true);
  });

  it('should generate gravatar with size', () => {
    const UserMock = sinon.mock(new User({}));
    const user = UserMock.object;
    const size = 300;

    const gravatar = user.gravatar(size);
    expect(gravatar.includes(`s=${size}`)).to.equal(true);
  });

  it('should generate gravatar with email', () => {
    const UserMock = sinon.mock(new User({ email: 'test@gmail.com' }));
    const user = UserMock.object;
    const md5 = '1aedb8d9dc4751e229a335e371db8058';

    const gravatar = user.gravatar();
    expect(gravatar.includes(md5)).to.equal(true);
  });
});

// Greeting Card

describe('Greeting Card Model', () => {
  it('should create a new video greeting card', (done) => {
    const GreetingCardMock = sinon.mock(new GreetingCard({ name: 'Sample Greeting Card', imageID: '0001', videoID: '0001', productID: '0001' }));
    const greetingcard = GreetingCardMock.object;

    GreetingCardMock
      .expects('save')
      .yields(null);

    greetingcard.save((err) => {
      GreetingCardMock.verify();
      GreetingCardMock.restore();
      expect(err).to.be.null;
      done();
    });
  });

  it('should create a new greeting card', (done) => {
    const GreetingCardMock = sinon.mock(new GreetingCard({ name: 'Sample Greeting Card', imageID: '0001', soundID: '0001', productID: '0002' }));
    const greetingcard = GreetingCardMock.object;

    GreetingCardMock
      .expects('save')
      .yields(null);

    greetingcard.save((err) => {
      GreetingCardMock.verify();
      GreetingCardMock.restore();
      expect(err).to.be.null;
      done();
    });
  });
});

// Image

describe('Image Model', () => {
  it('should create a new image', (done) => {
    const ImageMock = sinon.mock(new Image({ name: 'sample-image', caption: 'sample caption', signoff: 'Anonymous', format: 'jpg', size: '100 mb', greetingCardID: '' }));
    const image = ImageMock.object;

    ImageMock
      .expects('save')
      .yields(null);

    image.save((err) => {
      ImageMock.verify();
      ImageMock.restore();
      expect(err).to.be.null;
      done();
    });
  });
});

// Video

describe('Video Model', () => {
  it('should create a new video', (done) => {
    const VideoMock = sinon.mock(new Video({ name: 'sample-video', caption: 'sample caption', signoff: 'Anonymous', format: 'mp4', size: '250 mb', greetingCardID: '' }));
    const video = VideoMock.object;

    VideoMock
      .expects('save')
      .yields(null);

    video.save((err) => {
      VideoMock.verify();
      VideoMock.restore();
      expect(err).to.be.null;
      done();
    });
  });
});

// Sound

describe('Sound Model', () => {
  it('should create a new sound', (done) => {
    const SoundMock = sinon.mock(new Sound({ name: 'sample-sound', format: 'mp4', size: '250 mb', greetingCardID: '' }));
    const sound = SoundMock.object;

    SoundMock
      .expects('save')
      .yields(null);

    sound.save((err) => {
      SoundMock.verify();
      SoundMock.restore();
      expect(err).to.be.null;
      done();
    });
  });
});